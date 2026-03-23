import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
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

const dbDirectory = path.join(process.cwd(), "data");
const dbPath = path.join(dbDirectory, "momento.db");

declare global {
  var momentoDb: DatabaseSync | undefined;
}

function nowIso() {
  return new Date().toISOString();
}

function toDate(value: string | null | undefined) {
  return value ? new Date(value) : null;
}

function hasColumn(db: DatabaseSync, table: string, column: string) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some((row) => row.name === column);
}

function ensureDb() {
  if (!global.momentoDb) {
    fs.mkdirSync(dbDirectory, { recursive: true });
    global.momentoDb = new DatabaseSync(dbPath);
    createSchema(global.momentoDb);
    backfillSchema(global.momentoDb);
    seedDatabase(global.momentoDb);
  }

  return global.momentoDb;
}

function createSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      team TEXT NOT NULL,
      avatar TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      owner_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      start_date TEXT,
      due_date TEXT,
      owner_id TEXT,
      imported INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      due_date TEXT,
      estimated_hours INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      project_id TEXT,
      assignee_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      assignee_id TEXT,
      task_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS task_notes (
      id TEXT PRIMARY KEY,
      body TEXT NOT NULL,
      task_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS import_jobs (
      id TEXT PRIMARY KEY,
      source_name TEXT NOT NULL,
      source_path TEXT NOT NULL,
      project_id TEXT,
      rows_detected INTEGER NOT NULL,
      tasks_created INTEGER NOT NULL,
      subtasks_created INTEGER NOT NULL,
      status TEXT NOT NULL,
      summary TEXT NOT NULL,
      imported_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS productivity_snapshots (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      score INTEGER NOT NULL,
      completion_rate INTEGER NOT NULL,
      overdue_rate INTEGER NOT NULL,
      backlog_count INTEGER NOT NULL,
      summary TEXT NOT NULL,
      user_id TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

function backfillSchema(db: DatabaseSync) {
  if (!hasColumn(db, "projects", "program_id")) {
    db.exec("ALTER TABLE projects ADD COLUMN program_id TEXT");
  }

  const timestamp = nowIso();
  const user = db.prepare("SELECT id FROM users ORDER BY name ASC LIMIT 1").get() as { id: string } | undefined;
  const existingPrograms = db.prepare("SELECT COUNT(*) AS count FROM programs").get() as { count: number };

  if (existingPrograms.count === 0 && user) {
    const operatingProgramId = randomUUID();
    const growthProgramId = randomUUID();

    db.prepare("INSERT INTO programs VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      operatingProgramId,
      "Operations Excellence",
      "Internal systems, delivery control, and company execution visibility.",
      "Active",
      user.id,
      timestamp,
      timestamp,
    );
    db.prepare("INSERT INTO programs VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      growthProgramId,
      "Growth Systems",
      "Acquisition, SEO, and automation workstreams for repeatable growth.",
      "Active",
      user.id,
      timestamp,
      timestamp,
    );

    const projects = db.prepare("SELECT id, title FROM projects").all() as Array<{ id: string; title: string }>;
    for (const project of projects) {
      const mappedProgramId = /growth/i.test(project.title) ? growthProgramId : operatingProgramId;
      db.prepare("UPDATE projects SET program_id = ? WHERE id = ?").run(mappedProgramId, project.id);
    }
  }
}

function seedDatabase(db: DatabaseSync) {
  const existing = db.prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number };
  if (existing.count > 0) {
    return;
  }

  const timestamp = nowIso();
  const userIds = {
    Lenal: randomUUID(),
    Angel: randomUUID(),
    Akshi: randomUUID(),
    Ankita: randomUUID(),
  };

  const insertUser = db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  insertUser.run(userIds.Lenal, "Lenal", "lenal@neotechie.in", "Operations Lead", "Automation", null, 1, timestamp, timestamp);
  insertUser.run(userIds.Angel, "Angel", "angel@neotechie.in", "Automation Engineer", "Automation", null, 1, timestamp, timestamp);
  insertUser.run(userIds.Akshi, "Akshi", "akshi@neotechie.in", "SEO Analyst", "Growth", null, 1, timestamp, timestamp);
  insertUser.run(userIds.Ankita, "Ankita", "ankita@neotechie.in", "Research Specialist", "Growth", null, 1, timestamp, timestamp);

  const programIds = {
    operations: randomUUID(),
    growth: randomUUID(),
  };

  const insertProgram = db.prepare("INSERT INTO programs VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertProgram.run(
    programIds.operations,
    "Operations Excellence",
    "Internal systems, delivery rigor, knowledge visibility, and team operating rhythm.",
    "Active",
    userIds.Lenal,
    timestamp,
    timestamp,
  );
  insertProgram.run(
    programIds.growth,
    "Growth Systems",
    "Lead generation, campaign operations, SEO pipelines, and reusable automation.",
    "Active",
    userIds.Angel,
    timestamp,
    timestamp,
  );

  const insertProject = db.prepare("INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const launchId = randomUUID();
  const growthId = randomUUID();
  insertProject.run(launchId, programIds.operations, "Momento Platform Launch", "Build the internal work OS experience, dashboards, and company-wide productivity reporting.", "On Track", "Critical", "2026-03-18T00:00:00.000Z", "2026-04-08T00:00:00.000Z", userIds.Lenal, 0, timestamp, timestamp);
  insertProject.run(growthId, programIds.growth, "Growth Automation Sprint", "Operationalize SEO content sourcing and automate campaign prep.", "Needs Attention", "High", "2026-03-20T00:00:00.000Z", "2026-04-02T00:00:00.000Z", userIds.Angel, 0, timestamp, timestamp);

  const insertTask = db.prepare("INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const cockpitId = randomUUID();
  const hierarchyId = randomUUID();
  insertTask.run(cockpitId, "Design the executive cockpit", "Ship the branded dashboard, KPI bands, and trend cards for leadership visibility.", "In Progress", "Critical", "2026-03-26T00:00:00.000Z", 14, null, launchId, userIds.Lenal, timestamp, timestamp);
  insertTask.run(randomUUID(), "Implement Microsoft domain guard", "Restrict access to verified @neotechie.in identities and add sign-in UX copy.", "Queued", "High", "2026-03-28T00:00:00.000Z", 8, null, launchId, userIds.Angel, timestamp, timestamp);
  insertTask.run(hierarchyId, "Refine native hierarchy", "Model work as programs, projects, tasks, and subtasks instead of importing spreadsheets.", "In Progress", "High", "2026-03-24T00:00:00.000Z", 10, null, growthId, userIds.Akshi, timestamp, timestamp);
  insertTask.run(randomUUID(), "Prepare mobile quick-actions", "Ensure phone users can update task state, assignee, and notes without friction.", "Done", "Medium", "2026-03-22T00:00:00.000Z", 6, "2026-03-22T11:30:00.000Z", launchId, userIds.Ankita, timestamp, timestamp);

  const insertSubtask = db.prepare("INSERT INTO subtasks VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertSubtask.run(randomUUID(), "Draft dashboard information architecture", "Done", userIds.Lenal, cockpitId, timestamp, timestamp);
  insertSubtask.run(randomUUID(), "Add KPI row with productivity score", "In Progress", userIds.Angel, cockpitId, timestamp, timestamp);
  insertSubtask.run(randomUUID(), "Review mobile card hierarchy", "Queued", userIds.Ankita, cockpitId, timestamp, timestamp);
  insertSubtask.run(randomUUID(), "Add program selector to project creation", "In Progress", userIds.Akshi, hierarchyId, timestamp, timestamp);
  insertSubtask.run(randomUUID(), "Replace import center with program launchpad", "Queued", userIds.Angel, hierarchyId, timestamp, timestamp);

  const insertNote = db.prepare("INSERT INTO task_notes VALUES (?, ?, ?, ?, ?)");
  insertNote.run(randomUUID(), "Leadership wants the first screen to answer whether the team is productive in under 10 seconds.", cockpitId, userIds.Lenal, timestamp);
  insertNote.run(randomUUID(), "The core object model should feel native, not like a spreadsheet cleanup flow.", hierarchyId, userIds.Akshi, timestamp);

  const insertSnapshot = db.prepare("INSERT INTO productivity_snapshots VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  [
    ["2026-03-18", 62, 54, 22, 18, "Momentum building"],
    ["2026-03-19", 67, 58, 18, 16, "Faster completion"],
    ["2026-03-20", 71, 64, 17, 14, "Healthy throughput"],
    ["2026-03-21", 73, 66, 15, 13, "Stable execution"],
    ["2026-03-22", 76, 70, 12, 11, "Strong closeout"],
    ["2026-03-23", 78, 74, 11, 10, "Productive and improving"],
  ].forEach(([date, score, completionRate, overdueRate, backlogCount, summary]) => {
    insertSnapshot.run(randomUUID(), `${date}T00:00:00.000Z`, score, completionRate, overdueRate, backlogCount, summary, null, timestamp);
  });
}

export function getUsers(): UserRecord[] {
  const db = ensureDb();
  return (db.prepare("SELECT * FROM users ORDER BY name ASC").all() as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: String(row.role),
    team: String(row.team),
    avatar: row.avatar ? String(row.avatar) : null,
    active: Boolean(row.active),
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
  }));
}

export function getPrograms(): ProgramRecord[] {
  const db = ensureDb();
  return (db.prepare("SELECT * FROM programs ORDER BY title ASC").all() as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    status: String(row.status),
    ownerId: row.owner_id ? String(row.owner_id) : null,
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
  }));
}

export function getProjects(): ProjectRecord[] {
  const db = ensureDb();
  return (db.prepare("SELECT * FROM projects ORDER BY due_date IS NULL, due_date ASC, created_at DESC").all() as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    programId: row.program_id ? String(row.program_id) : null,
    title: String(row.title),
    description: String(row.description),
    status: String(row.status),
    priority: String(row.priority),
    startDate: toDate(row.start_date as string | null),
    dueDate: toDate(row.due_date as string | null),
    ownerId: row.owner_id ? String(row.owner_id) : null,
    imported: Boolean(row.imported),
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
  }));
}

export function getTasks(): TaskRecord[] {
  const db = ensureDb();
  return (db.prepare("SELECT * FROM tasks ORDER BY due_date IS NULL, due_date ASC, created_at DESC").all() as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    status: String(row.status),
    priority: String(row.priority),
    dueDate: toDate(row.due_date as string | null),
    estimatedHours: Number(row.estimated_hours),
    completedAt: toDate(row.completed_at as string | null),
    projectId: row.project_id ? String(row.project_id) : null,
    assigneeId: row.assignee_id ? String(row.assignee_id) : null,
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
  }));
}

export function getSubtasks(): SubtaskRecord[] {
  const db = ensureDb();
  return (db.prepare("SELECT * FROM subtasks ORDER BY created_at ASC").all() as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    status: String(row.status),
    assigneeId: row.assignee_id ? String(row.assignee_id) : null,
    taskId: String(row.task_id),
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
  }));
}

export function getTaskNotes(): TaskNoteRecord[] {
  const db = ensureDb();
  return (db.prepare("SELECT * FROM task_notes ORDER BY created_at DESC").all() as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    body: String(row.body),
    taskId: String(row.task_id),
    authorId: String(row.author_id),
    createdAt: new Date(String(row.created_at)),
  }));
}

export function getImportJobs(): ImportJobRecord[] {
  const db = ensureDb();
  return (db.prepare("SELECT * FROM import_jobs ORDER BY imported_at DESC").all() as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    sourceName: String(row.source_name),
    sourcePath: String(row.source_path),
    projectId: row.project_id ? String(row.project_id) : null,
    rowsDetected: Number(row.rows_detected),
    tasksCreated: Number(row.tasks_created),
    subtasksCreated: Number(row.subtasks_created),
    status: String(row.status),
    summary: String(row.summary),
    importedAt: new Date(String(row.imported_at)),
  }));
}

export function getProductivitySnapshots(): ProductivitySnapshotRecord[] {
  const db = ensureDb();
  return (db.prepare("SELECT * FROM productivity_snapshots ORDER BY date ASC").all() as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    date: new Date(String(row.date)),
    score: Number(row.score),
    completionRate: Number(row.completion_rate),
    overdueRate: Number(row.overdue_rate),
    backlogCount: Number(row.backlog_count),
    summary: String(row.summary),
    userId: row.user_id ? String(row.user_id) : null,
    createdAt: new Date(String(row.created_at)),
  }));
}

export function createProgram(input: {
  title: string;
  description: string;
  status: string;
  ownerId: string | null;
}) {
  const db = ensureDb();
  const timestamp = nowIso();
  db.prepare("INSERT INTO programs VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    randomUUID(),
    input.title,
    input.description,
    input.status,
    input.ownerId,
    timestamp,
    timestamp,
  );
}

export function createProject(input: {
  title: string;
  description: string;
  ownerId: string | null;
  status: string;
  priority: string;
  startDate: Date | null;
  dueDate: Date | null;
  programId: string | null;
}) {
  const db = ensureDb();
  const timestamp = nowIso();
  db.prepare("INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    randomUUID(),
    input.programId,
    input.title,
    input.description,
    input.status,
    input.priority,
    input.startDate?.toISOString() ?? null,
    input.dueDate?.toISOString() ?? null,
    input.ownerId,
    0,
    timestamp,
    timestamp,
  );
}

export function createTask(input: {
  title: string;
  description: string;
  status: string;
  priority: string;
  projectId: string | null;
  assigneeId: string | null;
  dueDate: Date | null;
  estimatedHours: number;
}) {
  const db = ensureDb();
  const timestamp = nowIso();
  db.prepare("INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    randomUUID(),
    input.title,
    input.description,
    input.status,
    input.priority,
    input.dueDate?.toISOString() ?? null,
    input.estimatedHours,
    input.status === "Done" ? timestamp : null,
    input.projectId,
    input.assigneeId,
    timestamp,
    timestamp,
  );
}

export function updateTaskStatus(taskId: string, status: string) {
  const db = ensureDb();
  db.prepare("UPDATE tasks SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?").run(
    status,
    status === "Done" ? nowIso() : null,
    nowIso(),
    taskId,
  );
}

export function addTaskNote(taskId: string, body: string) {
  const db = ensureDb();
  const user = db.prepare("SELECT id FROM users ORDER BY name ASC LIMIT 1").get() as { id: string } | undefined;
  if (!user) {
    return;
  }
  db.prepare("INSERT INTO task_notes VALUES (?, ?, ?, ?, ?)").run(randomUUID(), body, taskId, user.id, nowIso());
}
