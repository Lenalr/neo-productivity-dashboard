import { addTaskNoteAction, createSubtaskAction, createTaskAction, updateTaskStatusAction } from "@/app/actions";
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
              <h3>Add a task with subtasks</h3>
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
            <div className="field">
              <label htmlFor="subtasks">Subtasks</label>
              <textarea
                id="subtasks"
                name="subtasks"
                placeholder={"One subtask per line\nResearch source websites\nDraft title options\nReview with team"}
              />
            </div>
            <div className="field">
              <label htmlFor="subtaskAssigneeId">Default subtask assignee</label>
              <select id="subtaskAssigneeId" name="subtaskAssigneeId" defaultValue="">
                <option value="">Same as task / unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="button" type="submit">
              Add task
            </button>
          </form>
        </article>

        <article className="panel panel--dark">
          <div className="section-header">
            <div className="section-title">
              <p className="eyebrow">Execution Flow</p>
              <h3>Task first, checklist underneath</h3>
            </div>
          </div>
          <div className="surface-grid">
            <div className="surface">
              <p className="muted">Why this is better</p>
              <strong>Every task can carry its own live checklist</strong>
            </div>
            <div className="surface">
              <p className="muted">Best first step</p>
              <strong>Add teammates so assignments are meaningful</strong>
            </div>
          </div>
          <p style={{ marginTop: 18 }}>
            You can now create subtasks while creating a task, and also keep adding more subtasks later as the work evolves.
          </p>
        </article>
      </section>

      <section className="page-stack">
        {!tasks.length && (
          <article className="empty-state">
            No tasks yet. Add your team first, then create a task with its subtasks directly here.
          </article>
        )}

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

            <div style={{ marginTop: 18 }}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>
                Subtasks
              </p>
              {task.subtasks.length ? (
                <div className="stack-list">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="surface">
                      <div className="section-header" style={{ marginBottom: 0 }}>
                        <strong>{subtask.title}</strong>
                        <StatusBadge label={subtask.status} />
                      </div>
                      <div className="meta-row" style={{ marginTop: 8 }}>
                        <span>{users.find((user) => user.id === subtask.assigneeId)?.name ?? "Unassigned"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No subtasks yet.</div>
              )}
            </div>

            <form action={createSubtaskAction} className="inline-form" style={{ marginTop: 18 }}>
              <input type="hidden" name="taskId" value={task.id} />
              <div className="field">
                <label htmlFor={`subtask-${task.id}`}>Add subtask</label>
                <input id={`subtask-${task.id}`} name="title" placeholder="Add the next checklist item" />
              </div>
              <div className="field">
                <label htmlFor={`subtask-assignee-${task.id}`}>Assign to</label>
                <select id={`subtask-assignee-${task.id}`} name="assigneeId" defaultValue="">
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="button-secondary" type="submit">
                Add subtask
              </button>
            </form>

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
