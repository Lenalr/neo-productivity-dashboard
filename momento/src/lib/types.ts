export type ProgramRecord = {
  id: string;
  title: string;
  description: string;
  status: string;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  avatar: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectRecord = {
  id: string;
  programId: string | null;
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate: Date | null;
  dueDate: Date | null;
  ownerId: string | null;
  imported: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SubtaskRecord = {
  id: string;
  title: string;
  status: string;
  assigneeId: string | null;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskNoteRecord = {
  id: string;
  body: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
};

export type TaskRecord = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  estimatedHours: number;
  completedAt: Date | null;
  projectId: string | null;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ImportJobRecord = {
  id: string;
  sourceName: string;
  sourcePath: string;
  projectId: string | null;
  rowsDetected: number;
  tasksCreated: number;
  subtasksCreated: number;
  status: string;
  summary: string;
  importedAt: Date;
};

export type ProductivitySnapshotRecord = {
  id: string;
  date: Date;
  score: number;
  completionRate: number;
  overdueRate: number;
  backlogCount: number;
  summary: string;
  userId: string | null;
  createdAt: Date;
};
