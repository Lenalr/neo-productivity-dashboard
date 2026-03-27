import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

export type ParsedWorkbookTask = {
  title: string;
  owners: string[];
  subtasks: Array<{ title: string; owners: string[] }>;
  depth: number;
};

export type ParsedWorkbookProject = {
  projectTitle: string;
  tasks: ParsedWorkbookTask[];
};

export const workbookSourcePath =
  process.env.MOMENTO_IMPORT_FILE ||
  String.raw`C:\Users\Lenal\OneDrive - NeoTechie Private Limited\Tasks and management.xlsx`;

export function getWorkbookMeta() {
  const exists = fs.existsSync(workbookSourcePath);

  return {
    exists,
    path: workbookSourcePath,
    fileName: path.basename(workbookSourcePath),
  };
}

export function parseWorkbookFile(filePath = workbookSourcePath): ParsedWorkbookProject[] {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false }) as Array<
      Array<string | null | undefined>
    >;
    const projects: ParsedWorkbookProject[] = [];
    let currentProject: ParsedWorkbookProject | null = null;
    let currentTask: ParsedWorkbookTask | null = null;

    for (const row of rows) {
      const firstIndex = row.findIndex(
        (value) => value !== undefined && value !== null && String(value).trim() !== "",
      );

      if (firstIndex === -1) {
        continue;
      }

      const title = String(row[firstIndex]).trim();
      const ownerRaw = row[firstIndex + 1] ? String(row[firstIndex + 1]).trim() : "";
      const owners = ownerRaw
        .split(/\s+and\s+|,/i)
        .map((item) => item.trim())
        .filter(Boolean);

      if (firstIndex <= 1) {
        currentProject = { projectTitle: title, tasks: [] };
        projects.push(currentProject);
        currentTask = null;
        continue;
      }

      if (!currentProject) {
        currentProject = { projectTitle: "Imported Workflow", tasks: [] };
        projects.push(currentProject);
      }

      if (firstIndex <= 4 || !currentTask) {
        currentTask = { title, owners, subtasks: [], depth: firstIndex };
        currentProject.tasks.push(currentTask);
        continue;
      }

      currentTask.subtasks.push({ title, owners });
    }

    return projects;
  } catch {
    return [];
  }
}

export function getWorkbookPreview() {
  const projects = parseWorkbookFile();
  const taskCount = projects.reduce((sum, project) => sum + project.tasks.length, 0);
  const subtaskCount = projects.reduce(
    (sum, project) => sum + project.tasks.reduce((taskSum, task) => taskSum + task.subtasks.length, 0),
    0,
  );

  return {
    projects,
    taskCount,
    subtaskCount,
  };
}
