import { cookies } from "next/headers";
import { calculateDashboardMetrics, describeProductivity } from "@/lib/dashboard";
import { deserializeStore, storeCookieName } from "@/lib/db";

export async function getMomentoData() {
  const cookieStore = await cookies();
  const base = deserializeStore(cookieStore.get(storeCookieName)?.value);

  const users = base.users;
  const programsBase = base.programs;
  const projectsBase = base.projects;
  const tasksBase = base.tasks;
  const subtasks = base.subtasks;
  const notes = base.notes;
  const importJobs = base.importJobs;
  const snapshots = base.snapshots;

  const userMap = new Map(users.map((user) => [user.id, user]));
  const programMap = new Map(programsBase.map((program) => [program.id, program]));
  const subtasksByTask = new Map<string, typeof subtasks>();
  const notesByTask = new Map<string, Array<(typeof notes)[number] & { author: (typeof users)[number] }>>();

  for (const subtask of subtasks) {
    const current = subtasksByTask.get(subtask.taskId) ?? [];
    current.push(subtask);
    subtasksByTask.set(subtask.taskId, current);
  }

  for (const note of notes) {
    const author = userMap.get(note.authorId);
    if (!author) {
      continue;
    }
    const current = notesByTask.get(note.taskId) ?? [];
    current.push({ ...note, author });
    notesByTask.set(note.taskId, current);
  }

  const projects = projectsBase.map((project) => ({
    ...project,
    program: project.programId ? programMap.get(project.programId) ?? null : null,
    owner: project.ownerId ? userMap.get(project.ownerId) ?? null : null,
    tasks: [] as Array<(typeof tasksBase)[number] & { assignee: (typeof users)[number] | null; subtasks: typeof subtasks }>,
  }));

  const projectMap = new Map(projects.map((project) => [project.id, project]));

  const tasks = tasksBase.map((task) => ({
    ...task,
    assignee: task.assigneeId ? userMap.get(task.assigneeId) ?? null : null,
    project: task.projectId ? projectMap.get(task.projectId) ?? null : null,
    subtasks: subtasksByTask.get(task.id) ?? [],
    notes: notesByTask.get(task.id) ?? [],
  }));

  for (const project of projects) {
    project.tasks = tasks.filter((task) => task.projectId === project.id);
  }

  const programs = programsBase.map((program) => ({
    ...program,
    owner: program.ownerId ? userMap.get(program.ownerId) ?? null : null,
    projects: projects.filter((project) => project.programId === program.id),
  }));

  const metrics = calculateDashboardMetrics({ projects, tasks, users, importJobs, snapshots });

  return {
    users,
    programs,
    projects,
    tasks,
    importJobs,
    snapshots,
    metrics,
    productivityNarrative: describeProductivity(metrics.productivityScore),
  };
}
