import { randomUUID } from "node:crypto";
import type {
  ImportJobRecord,
  ProductivitySnapshotRecord,
  ProgramRecord,
  ProjectRecord,
  SubtaskRecord,
  TaskNoteRecord,
  TaskRecord,
  UserRecord,
} from "@/lib/types";

export type Store = {
  users: UserRecord[];
  programs: ProgramRecord[];
  projects: ProjectRecord[];
  tasks: TaskRecord[];
  subtasks: SubtaskRecord[];
  notes: TaskNoteRecord[];
  importJobs: ImportJobRecord[];
  snapshots: ProductivitySnapshotRecord[];
};

export const storeCookieName = "momento-store";

function stamp() {
  return new Date();
}

function cloneDate(date: Date | null) {
  return date ? new Date(date) : null;
}

function cloneStore(store: Store): Store {
  return {
    users: store.users.map((item) => ({ ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) })),
    programs: store.programs.map((item) => ({ ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) })),
    projects: store.projects.map((item) => ({
      ...item,
      startDate: cloneDate(item.startDate),
      dueDate: cloneDate(item.dueDate),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })),
    tasks: store.tasks.map((item) => ({
      ...item,
      dueDate: cloneDate(item.dueDate),
      completedAt: cloneDate(item.completedAt),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })),
    subtasks: store.subtasks.map((item) => ({ ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) })),
    notes: store.notes.map((item) => ({ ...item, createdAt: new Date(item.createdAt) })),
    importJobs: store.importJobs.map((item) => ({ ...item, importedAt: new Date(item.importedAt) })),
    snapshots: store.snapshots.map((item) => ({ ...item, date: new Date(item.date), createdAt: new Date(item.createdAt) })),
  };
}

export function seedStore(): Store {
  return {
    users: [],
    programs: [],
    projects: [],
    tasks: [],
    subtasks: [],
    notes: [],
    importJobs: [],
    snapshots: [],
  };
}

export function deserializeStore(raw: string | undefined): Store {
  if (!raw) {
    return seedStore();
  }

  try {
    const parsed = JSON.parse(raw) as {
      users?: UserRecord[];
      programs?: ProgramRecord[];
      projects?: ProjectRecord[];
      tasks?: TaskRecord[];
      subtasks?: SubtaskRecord[];
      notes?: TaskNoteRecord[];
      importJobs?: ImportJobRecord[];
      snapshots?: ProductivitySnapshotRecord[];
    };

    return cloneStore({
      users: parsed.users ?? [],
      programs: parsed.programs ?? [],
      projects: parsed.projects ?? [],
      tasks: parsed.tasks ?? [],
      subtasks: parsed.subtasks ?? [],
      notes: parsed.notes ?? [],
      importJobs: parsed.importJobs ?? [],
      snapshots: parsed.snapshots ?? [],
    });
  } catch {
    return seedStore();
  }
}

export function serializeStore(store: Store) {
  return JSON.stringify(store);
}

export function createProgramInStore(
  store: Store,
  input: {
    title: string;
    description: string;
    status: string;
    ownerId: string | null;
  },
) {
  const next = cloneStore(store);
  const createdAt = stamp();
  next.programs.unshift({
    id: randomUUID(),
    title: input.title,
    description: input.description,
    status: input.status,
    ownerId: input.ownerId,
    createdAt,
    updatedAt: createdAt,
  });
  return next;
}

export function createProjectInStore(
  store: Store,
  input: {
    title: string;
    description: string;
    ownerId: string | null;
    status: string;
    priority: string;
    startDate: Date | null;
    dueDate: Date | null;
    programId: string | null;
  },
) {
  const next = cloneStore(store);
  const createdAt = stamp();
  next.projects.unshift({
    id: randomUUID(),
    programId: input.programId,
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    startDate: input.startDate,
    dueDate: input.dueDate,
    ownerId: input.ownerId,
    imported: false,
    createdAt,
    updatedAt: createdAt,
  });
  return next;
}

export function createTaskInStore(
  store: Store,
  input: {
    title: string;
    description: string;
    status: string;
    priority: string;
    projectId: string | null;
    assigneeId: string | null;
    dueDate: Date | null;
    estimatedHours: number;
    subtasks?: Array<{ title: string; assigneeId: string | null }>;
  },
) {
  const next = cloneStore(store);
  const createdAt = stamp();
  const taskId = randomUUID();

  next.tasks.unshift({
    id: taskId,
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    dueDate: input.dueDate,
    estimatedHours: input.estimatedHours,
    completedAt: input.status === "Done" ? createdAt : null,
    projectId: input.projectId,
    assigneeId: input.assigneeId,
    createdAt,
    updatedAt: createdAt,
  });

  for (const subtask of input.subtasks ?? []) {
    if (!subtask.title.trim()) {
      continue;
    }

    next.subtasks.unshift({
      id: randomUUID(),
      title: subtask.title.trim(),
      status: "Queued",
      assigneeId: subtask.assigneeId,
      taskId,
      createdAt,
      updatedAt: createdAt,
    });
  }

  return next;
}

export function createUserInStore(
  store: Store,
  input: {
    name: string;
    email: string;
    role: string;
    team: string;
  },
) {
  const next = cloneStore(store);
  const createdAt = stamp();
  next.users.unshift({
    id: randomUUID(),
    name: input.name,
    email: input.email,
    role: input.role,
    team: input.team,
    avatar: null,
    active: true,
    createdAt,
    updatedAt: createdAt,
  });
  return next;
}

export function createSubtaskInStore(
  store: Store,
  input: {
    taskId: string;
    title: string;
    assigneeId: string | null;
  },
) {
  const next = cloneStore(store);
  const createdAt = stamp();
  next.subtasks.unshift({
    id: randomUUID(),
    title: input.title,
    status: "Queued",
    assigneeId: input.assigneeId,
    taskId: input.taskId,
    createdAt,
    updatedAt: createdAt,
  });
  return next;
}

export function updateTaskStatusInStore(store: Store, taskId: string, status: string) {
  const next = cloneStore(store);
  const task = next.tasks.find((item) => item.id === taskId);
  if (!task) {
    return next;
  }

  task.status = status;
  task.completedAt = status === "Done" ? stamp() : null;
  task.updatedAt = stamp();
  return next;
}

export function addTaskNoteInStore(store: Store, taskId: string, body: string) {
  const next = cloneStore(store);
  const author = next.users[0];
  if (!author) {
    return next;
  }

  next.notes.unshift({
    id: randomUUID(),
    body,
    taskId,
    authorId: author.id,
    createdAt: stamp(),
  });

  return next;
}
