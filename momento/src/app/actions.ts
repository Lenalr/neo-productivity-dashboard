"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  addTaskNoteInStore,
  createProgramInStore,
  createProjectInStore,
  createSubtaskInStore,
  createTaskInStore,
  createUserInStore,
  deserializeStore,
  serializeStore,
  storeCookieName,
  updateTaskStatusInStore,
} from "@/lib/db";

function optionalDate(value: FormDataEntryValue | null) {
  if (!value) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized ? new Date(normalized) : null;
}

async function readStore() {
  const cookieStore = await cookies();
  return deserializeStore(cookieStore.get(storeCookieName)?.value);
}

async function writeStore(nextStore: ReturnType<typeof deserializeStore>) {
  const cookieStore = await cookies();
  cookieStore.set(storeCookieName, serializeStore(nextStore), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function createProgramAction(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!title || !description) {
    return;
  }

  const nextStore = createProgramInStore(await readStore(), {
    title,
    description,
    status: String(formData.get("status") || "Active"),
    ownerId: String(formData.get("ownerId") || "").trim() || null,
  });

  await writeStore(nextStore);
  revalidatePath("/");
  revalidatePath("/programs");
  revalidatePath("/projects");
}

export async function createProjectAction(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const ownerId = String(formData.get("ownerId") || "").trim() || null;
  const status = String(formData.get("status") || "On Track");
  const priority = String(formData.get("priority") || "Medium");

  if (!title || !description) {
    return;
  }

  const nextStore = createProjectInStore(await readStore(), {
    title,
    description,
    ownerId,
    status,
    priority,
    dueDate: optionalDate(formData.get("dueDate")),
    startDate: optionalDate(formData.get("startDate")),
    programId: String(formData.get("programId") || "").trim() || null,
  });

  await writeStore(nextStore);
  revalidatePath("/");
  revalidatePath("/programs");
  revalidatePath("/projects");
}

export async function createTaskAction(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!title || !description) {
    return;
  }

  const rawSubtasks = String(formData.get("subtasks") || "");
  const rawSubtaskAssigneeId = String(formData.get("subtaskAssigneeId") || "").trim() || null;
  const subtasks = rawSubtasks
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => ({ title: item, assigneeId: rawSubtaskAssigneeId }));

  const nextStore = createTaskInStore(await readStore(), {
    title,
    description,
    status: String(formData.get("status") || "Queued"),
    priority: String(formData.get("priority") || "Medium"),
    projectId: String(formData.get("projectId") || "").trim() || null,
    assigneeId: String(formData.get("assigneeId") || "").trim() || null,
    dueDate: optionalDate(formData.get("dueDate")),
    estimatedHours: Number(formData.get("estimatedHours") || 0),
    subtasks,
  });

  await writeStore(nextStore);
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/programs");
  revalidatePath("/team");
}

export async function createUserAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const team = String(formData.get("team") || "").trim();

  if (!name || !email || !role || !team) {
    return;
  }

  const nextStore = createUserInStore(await readStore(), { name, email, role, team });
  await writeStore(nextStore);
  revalidatePath("/");
  revalidatePath("/programs");
  revalidatePath("/projects");
  revalidatePath("/tasks");
  revalidatePath("/team");
}

export async function createSubtaskAction(formData: FormData) {
  const taskId = String(formData.get("taskId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const assigneeId = String(formData.get("assigneeId") || "").trim() || null;

  if (!taskId || !title) {
    return;
  }

  const nextStore = createSubtaskInStore(await readStore(), { taskId, title, assigneeId });
  await writeStore(nextStore);
  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/team");
}

export async function updateTaskStatusAction(formData: FormData) {
  const taskId = String(formData.get("taskId") || "");
  const status = String(formData.get("status") || "Queued");
  if (!taskId) {
    return;
  }

  const nextStore = updateTaskStatusInStore(await readStore(), taskId, status);
  await writeStore(nextStore);
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/programs");
  revalidatePath("/team");
}

export async function addTaskNoteAction(formData: FormData) {
  const body = String(formData.get("body") || "").trim();
  const taskId = String(formData.get("taskId") || "");
  if (!body || !taskId) {
    return;
  }

  const nextStore = addTaskNoteInStore(await readStore(), taskId, body);
  await writeStore(nextStore);
  revalidatePath("/tasks");
}
