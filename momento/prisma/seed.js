const { PrismaClient } = require("@prisma/client");
const XLSX = require("xlsx");

const prisma = new PrismaClient();

const workbookPath =
  process.env.MOMENTO_IMPORT_FILE ||
  String.raw`C:\Users\Lenal\OneDrive - NeoTechie Private Limited\Tasks and management'.xlsx`;

const users = [
  { name: "Lenal", email: "lenal@neotechie.in", role: "Operations Lead", team: "Automation" },
  { name: "Angel", email: "angel@neotechie.in", role: "Automation Engineer", team: "Automation" },
  { name: "Akshi", email: "akshi@neotechie.in", role: "SEO Analyst", team: "Growth" },
  { name: "Ankita", email: "ankita@neotechie.in", role: "Research Specialist", team: "Growth" },
];

function parseWorkbookRows(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
    const structured = [];
    let projectTitle = "Automation";
    let currentTask = null;

    for (const row of rows) {
      const firstIndex = row.findIndex((value) => value !== undefined && value !== null && String(value).trim() !== "");
      if (firstIndex === -1) {
        continue;
      }

      const text = String(row[firstIndex]).trim();
      const ownerRaw = row[firstIndex + 1] ? String(row[firstIndex + 1]).trim() : "";
      const owners = ownerRaw
        .split(/\s+and\s+|,/i)
        .map((item) => item.trim())
        .filter(Boolean);

      if (firstIndex <= 1) {
        projectTitle = text;
        currentTask = null;
        continue;
      }

      if (firstIndex <= 4 || !currentTask) {
        currentTask = { title: text, owners, subtasks: [] };
        structured.push({ projectTitle, task: currentTask });
      } else {
        currentTask.subtasks.push({ title: text, owners });
      }
    }

    return structured;
  } catch (error) {
    return [];
  }
}

async function seedWorkbookImport(userByName) {
  const parsed = parseWorkbookRows(workbookPath);
  if (!parsed.length) {
    return;
  }

  const importedProject = await prisma.project.upsert({
    where: { title: "Excel Migration: Automation" },
    update: {
      description: "Imported from the existing spreadsheet workflow to bootstrap Momento.",
      status: "Active",
      priority: "High",
      imported: true,
    },
    create: {
      title: "Excel Migration: Automation",
      description: "Imported from the existing spreadsheet workflow to bootstrap Momento.",
      status: "Active",
      priority: "High",
      imported: true,
      ownerId: userByName.Lenal?.id ?? null,
    },
  });

  await prisma.task.deleteMany({ where: { projectId: importedProject.id } });

  let taskCount = 0;
  let subtaskCount = 0;

  for (const item of parsed) {
    const primaryOwner = item.task.owners[0] ? userByName[item.task.owners[0]]?.id : null;
    const task = await prisma.task.create({
      data: {
        title: item.task.title,
        description: `Imported from workbook section "${item.projectTitle}".`,
        status: "In Progress",
        priority: "High",
        estimatedHours: 6,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
        projectId: importedProject.id,
        assigneeId: primaryOwner ?? userByName.Lenal?.id ?? null,
      },
    });

    taskCount += 1;

    for (const subtask of item.task.subtasks) {
      const subtaskOwner = subtask.owners[0] ? userByName[subtask.owners[0]]?.id : null;
      await prisma.subtask.create({
        data: {
          title: subtask.title,
          status: "Queued",
          taskId: task.id,
          assigneeId: subtaskOwner ?? primaryOwner ?? null,
        },
      });
      subtaskCount += 1;
    }
  }

  await prisma.importJob.create({
    data: {
      sourceName: "Tasks and management'.xlsx",
      sourcePath: workbookPath,
      projectId: importedProject.id,
      rowsDetected: parsed.length,
      tasksCreated: taskCount,
      subtasksCreated: subtaskCount,
      status: "Completed",
      summary: "Imported the existing Excel automation workflow into Momento seed data.",
    },
  });
}

async function main() {
  await prisma.productivitySnapshot.deleteMany();
  await prisma.taskNote.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.importJob.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = {};
  for (const user of users) {
    createdUsers[user.name] = await prisma.user.create({ data: user });
  }

  const platformLaunch = await prisma.project.create({
    data: {
      title: "Momento Platform Launch",
      description: "Build the internal work OS experience, dashboards, and company-wide productivity reporting.",
      status: "On Track",
      priority: "Critical",
      startDate: new Date("2026-03-18T00:00:00.000Z"),
      dueDate: new Date("2026-04-08T00:00:00.000Z"),
      ownerId: createdUsers.Lenal.id,
    },
  });

  const growthSprint = await prisma.project.create({
    data: {
      title: "Growth Automation Sprint",
      description: "Operationalize SEO content sourcing and automate campaign prep.",
      status: "Needs Attention",
      priority: "High",
      startDate: new Date("2026-03-20T00:00:00.000Z"),
      dueDate: new Date("2026-04-02T00:00:00.000Z"),
      ownerId: createdUsers.Angel.id,
    },
  });

  const taskOne = await prisma.task.create({
    data: {
      title: "Design the executive cockpit",
      description: "Ship the branded dashboard, KPI bands, and trend cards for leadership visibility.",
      status: "In Progress",
      priority: "Critical",
      estimatedHours: 14,
      dueDate: new Date("2026-03-26T00:00:00.000Z"),
      projectId: platformLaunch.id,
      assigneeId: createdUsers.Lenal.id,
    },
  });

  const taskTwo = await prisma.task.create({
    data: {
      title: "Implement Microsoft domain guard",
      description: "Restrict access to verified @neotechie.in identities and add sign-in UX copy.",
      status: "Queued",
      priority: "High",
      estimatedHours: 8,
      dueDate: new Date("2026-03-28T00:00:00.000Z"),
      projectId: platformLaunch.id,
      assigneeId: createdUsers.Angel.id,
    },
  });

  const taskThree = await prisma.task.create({
    data: {
      title: "Consolidate workbook import logic",
      description: "Translate spreadsheet rows into normalized projects, tasks, and subtasks.",
      status: "At Risk",
      priority: "High",
      estimatedHours: 10,
      dueDate: new Date("2026-03-24T00:00:00.000Z"),
      projectId: growthSprint.id,
      assigneeId: createdUsers.Akshi.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Prepare mobile quick-actions",
      description: "Ensure phone users can update task state, assignee, and notes without friction.",
      status: "Done",
      priority: "Medium",
      estimatedHours: 6,
      dueDate: new Date("2026-03-22T00:00:00.000Z"),
      completedAt: new Date("2026-03-22T11:30:00.000Z"),
      projectId: platformLaunch.id,
      assigneeId: createdUsers.Ankita.id,
    },
  });

  await prisma.subtask.createMany({
    data: [
      { title: "Draft dashboard information architecture", status: "Done", taskId: taskOne.id, assigneeId: createdUsers.Lenal.id },
      { title: "Add revenue-style KPI row with productivity score", status: "In Progress", taskId: taskOne.id, assigneeId: createdUsers.Angel.id },
      { title: "Review mobile card hierarchy", status: "Queued", taskId: taskOne.id, assigneeId: createdUsers.Ankita.id },
      { title: "Connect workbook parser to import summary", status: "In Progress", taskId: taskThree.id, assigneeId: createdUsers.Akshi.id },
      { title: "Map owners to internal accounts", status: "Queued", taskId: taskThree.id, assigneeId: createdUsers.Angel.id },
    ],
  });

  await prisma.taskNote.createMany({
    data: [
      {
        body: "Leadership wants the first screen to answer whether the team is productive in under 10 seconds.",
        taskId: taskOne.id,
        authorId: createdUsers.Lenal.id,
      },
      {
        body: "Workbook structure is inconsistent, so import preview should show a confidence summary before commit.",
        taskId: taskThree.id,
        authorId: createdUsers.Akshi.id,
      },
    ],
  });

  const snapshotDays = [
    ["2026-03-18", 62, 54, 22, 18, "Momentum building"],
    ["2026-03-19", 67, 58, 18, 16, "Faster completion"],
    ["2026-03-20", 71, 64, 17, 14, "Healthy throughput"],
    ["2026-03-21", 73, 66, 15, 13, "Stable execution"],
    ["2026-03-22", 76, 70, 12, 11, "Strong closeout"],
    ["2026-03-23", 78, 74, 11, 10, "Productive and improving"],
  ];

  for (const [date, score, completionRate, overdueRate, backlogCount, summary] of snapshotDays) {
    await prisma.productivitySnapshot.create({
      data: {
        date: new Date(`${date}T00:00:00.000Z`),
        score,
        completionRate,
        overdueRate,
        backlogCount,
        summary,
      },
    });
  }

  await seedWorkbookImport(createdUsers);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
