"use server";

import { revalidatePath } from "next/cache";
import { addTaskNote, createProgram, createProject, createTask, updateTaskStatus } from "@/lib/db";

function optionalDate(value: FormDataEntryValue | null) {
  if (!value) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized ? new Date(normalized) : null;
}

export async function createProgramAction(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!title || !description) {
    return;
  }

  createProgram({
    title,
    description,
    status: String(formData.get("status") || "Active"),
    ownerId: String(formData.get("ownerId") || "").trim() || null,
  });

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

  createProject({
    title,
    description,
    ownerId,
    status,
    priority,
    dueDate: optionalDate(formData.get("dueDate")),
    startDate: optionalDate(formData.get("startDate")),
    programId: String(formData.get("programId") || "").trim() || null,
  });

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

  createTask({
    title,
    description,
    status: String(formData.get("status") || "Queued"),
    priority: String(formData.get("priority") || "Medium"),
    projectId: String(formData.get("projectId") || "").trim() || null,
    assigneeId: String(formData.get("assigneeId") || "").trim() || null,
    dueDate: optionalDate(formData.get("dueDate")),
    estimatedHours: Number(formData.get("estimatedHours") || 0),
  });

  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/programs");
  revalidatePath("/team");
}

export async function updateTaskStatusAction(formData: FormData) {
  const taskId = String(formData.get("taskId") || "");
  const status = String(formData.get("status") || "Queued");
  if (!taskId) {
    return;
  }

  updateTaskStatus(taskId, status);
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

  addTaskNote(taskId, body);
  revalidatePath("/tasks");
}
