import type {
  ImportJobRecord,
  ProductivitySnapshotRecord,
  ProjectRecord,
  SubtaskRecord,
  TaskNoteRecord,
  TaskRecord,
  UserRecord,
} from "@/lib/types";

export type TaskWithRelations = TaskRecord & {
  assignee: UserRecord | null;
  project: (ProjectRecord & { program?: { id: string; title: string } | null }) | null;
  subtasks: SubtaskRecord[];
  notes: Array<TaskNoteRecord & { author: UserRecord }>;
};

export type ProjectWithSummary = ProjectRecord & {
  program?: { id: string; title: string } | null;
  owner: UserRecord | null;
  tasks: Array<TaskRecord & { assignee: UserRecord | null; subtasks: SubtaskRecord[] }>;
};

export type DashboardPayload = {
  projects: ProjectWithSummary[];
  tasks: TaskWithRelations[];
  users: UserRecord[];
  importJobs: ImportJobRecord[];
  snapshots: ProductivitySnapshotRecord[];
};

export function calculateDashboardMetrics(payload: DashboardPayload) {
  const totalTasks = payload.tasks.length;
  const completedTasks = payload.tasks.filter((task) => task.status === "Done").length;
  const overdueTasks = payload.tasks.filter(
    (task) => task.dueDate && task.status !== "Done" && task.dueDate.getTime() < Date.now(),
  ).length;
  const inFlightTasks = payload.tasks.filter((task) => task.status === "In Progress").length;
  const activeProjects = payload.projects.filter((project) => project.status !== "Done").length;
  const teamLoad = payload.users.map((user) => {
    const assignedTasks = payload.tasks.filter((task) => task.assigneeId === user.id);
    const done = assignedTasks.filter((task) => task.status === "Done").length;
    const overdue = assignedTasks.filter(
      (task) => task.dueDate && task.status !== "Done" && task.dueDate.getTime() < Date.now(),
    ).length;
    const completionRate = assignedTasks.length ? Math.round((done / assignedTasks.length) * 100) : 0;

    return {
      user,
      assigned: assignedTasks.length,
      done,
      overdue,
      completionRate,
    };
  });

  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueRate = totalTasks ? Math.round((overdueTasks / totalTasks) * 100) : 0;
  const workloadBalance = teamLoad.length
    ? Math.max(...teamLoad.map((item) => item.assigned)) - Math.min(...teamLoad.map((item) => item.assigned))
    : 0;
  const productivityScore = Math.max(0, Math.min(100, completionRate + (100 - overdueRate) - workloadBalance * 3));

  let productivityLabel = "Stable";
  if (productivityScore >= 85) {
    productivityLabel = "Productive";
  } else if (productivityScore >= 70) {
    productivityLabel = "Improving";
  } else if (productivityScore < 55) {
    productivityLabel = "At Risk";
  }

  return {
    totalTasks,
    completedTasks,
    overdueTasks,
    inFlightTasks,
    activeProjects,
    completionRate,
    overdueRate,
    productivityScore,
    productivityLabel,
    teamLoad,
    topPriorityTasks: payload.tasks
      .filter((task) => task.status !== "Done")
      .sort((a, b) => {
        const dateA = a.dueDate ? a.dueDate.getTime() : Number.MAX_SAFE_INTEGER;
        const dateB = b.dueDate ? b.dueDate.getTime() : Number.MAX_SAFE_INTEGER;
        return dateA - dateB;
      })
      .slice(0, 5),
  };
}

export function describeProductivity(score: number) {
  if (score >= 85) {
    return "The team is converting effort into output consistently, with low delivery drag.";
  }

  if (score >= 70) {
    return "Execution is healthy, but a few overdue items are preventing a top-tier productivity score.";
  }

  if (score >= 55) {
    return "Momentum exists, but overdue work and uneven ownership are making delivery feel noisy.";
  }

  return "The operating rhythm is under strain. Clear blockers, rebalance ownership, and reduce overdue backlog.";
}
