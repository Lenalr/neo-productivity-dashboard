import { addTaskNoteAction, createTaskAction, updateTaskStatusAction } from "@/app/actions";
import { StatusBadge } from "@/components/status-badge";
import { getMomentoData } from "@/lib/data";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
  if (!date) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function TasksPage() {
  const { tasks, projects, users } = await getMomentoData();

  return (
    <div className="page-stack">
      <section className="section-header">
        <div className="section-title">
          <p className="eyebrow">Tasks</p>
          <h2>Daily execution command center</h2>
        </div>
      </section>

      <section className="two-column">
        <article className="form-card">
          <div className="section-header">
            <div className="section-title">
              <p className="eyebrow">Create</p>
              <h3>Add a task</h3>
            </div>
          </div>
          <form action={createTaskAction}>
            <div className="field">
              <label htmlFor="title">Task title</label>
              <input id="title" name="title" placeholder="Ex: Build phone dashboard cards" required />
            </div>
            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" placeholder="What should be done?" required />
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="projectId">Project</label>
                <select id="projectId" name="projectId" defaultValue="">
                  <option value="">General queue</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="assigneeId">Assignee</label>
                <select id="assigneeId" name="assigneeId" defaultValue="">
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="priority">Priority</label>
                <select id="priority" name="priority" defaultValue="High">
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" defaultValue="Queued">
                  <option>Queued</option>
                  <option>In Progress</option>
                  <option>At Risk</option>
                  <option>Done</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="dueDate">Due date</label>
                <input id="dueDate" name="dueDate" type="date" />
              </div>
              <div className="field">
                <label htmlFor="estimatedHours">Estimated hours</label>
                <input id="estimatedHours" name="estimatedHours" type="number" min="0" defaultValue="4" />
              </div>
            </div>
            <button className="button" type="submit">
              Add task
            </button>
          </form>
        </article>

        <article className="panel panel--dark">
          <div className="section-header">
            <div className="section-title">
              <p className="eyebrow">Phone-Ready</p>
              <h3>Fast mobile actions</h3>
            </div>
          </div>
          <div className="surface-grid">
            <div className="surface">
              <p className="muted">Ideal mobile flow</p>
              <strong>Open, update, assign, note</strong>
            </div>
            <div className="surface">
              <p className="muted">Desktop-first work</p>
              <strong>Bulk editing and dense planning</strong>
            </div>
          </div>
          <p style={{ marginTop: 18 }}>
            The task center is designed so your team can quickly update status from a phone browser without needing
            the full desktop management surface.
          </p>
        </article>
      </section>

      <section className="page-stack">
        {tasks.map((task) => (
          <article key={task.id} className="list-card">
            <div className="section-header">
              <div className="section-title">
                <p className="eyebrow">{task.priority} priority</p>
                <h3>{task.title}</h3>
              </div>
              <StatusBadge
                label={task.status}
                tone={task.status === "Done" ? "good" : task.status === "At Risk" ? "critical" : "warn"}
              />
            </div>
            <p className="muted">{task.description}</p>
            <div className="meta-row" style={{ marginTop: 12 }}>
              <span>{task.project?.program?.title ?? "No program"}</span>
              <span>{task.project?.title ?? "General queue"}</span>
              <span>{task.assignee?.name ?? "Unassigned"}</span>
              <span>{formatDate(task.dueDate)}</span>
              <span>{task.estimatedHours}h estimate</span>
            </div>
            <div className="compact-actions" style={{ marginTop: 16 }}>
              {["Queued", "In Progress", "At Risk", "Done"].map((status) => (
                <form key={status} action={updateTaskStatusAction} className="inline-form">
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="status" value={status} />
                  <button className={status === task.status ? "button" : "button-secondary"} type="submit">
                    {status}
                  </button>
                </form>
              ))}
            </div>

            {!!task.subtasks.length && (
              <div style={{ marginTop: 18 }}>
                <p className="eyebrow" style={{ marginBottom: 10 }}>
                  Subtasks
                </p>
                <div className="pill-group">
                  {task.subtasks.map((subtask) => (
                    <StatusBadge key={subtask.id} label={`${subtask.title} • ${subtask.status}`} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>
                Notes
              </p>
              <div className="stack-list">
                {task.notes.length ? (
                  task.notes.map((note) => (
                    <div key={note.id} className="surface">
                      <strong>{note.author.name}</strong>
                      <p className="muted" style={{ marginTop: 6 }}>
                        {note.body}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">No notes yet.</div>
                )}
              </div>
              <form action={addTaskNoteAction} className="inline-form" style={{ marginTop: 14 }}>
                <input type="hidden" name="taskId" value={task.id} />
                <div className="field">
                  <label htmlFor={`note-${task.id}`}>Add note</label>
                  <textarea id={`note-${task.id}`} name="body" placeholder="Share a blocker, update, or next step." />
                </div>
                <button className="button" type="submit">
                  Save note
                </button>
              </form>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
