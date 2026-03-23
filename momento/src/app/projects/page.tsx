import { createProjectAction } from "@/app/actions";
import { StatusBadge } from "@/components/status-badge";
import { getMomentoData } from "@/lib/data";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
  if (!date) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function ProjectsPage() {
  const { projects, users, programs } = await getMomentoData();

  return (
    <div className="page-stack">
      <section className="section-header">
        <div className="section-title">
          <p className="eyebrow">Projects</p>
          <h2>Portfolio and rollout control</h2>
        </div>
      </section>

      <section className="two-column">
        <article className="form-card">
          <div className="section-header">
            <div className="section-title">
              <p className="eyebrow">Create</p>
              <h3>Add a new project</h3>
            </div>
          </div>
          <form action={createProjectAction}>
            <div className="field">
              <label htmlFor="title">Project title</label>
              <input id="title" name="title" placeholder="Ex: Growth intelligence hub" required />
            </div>
            <div className="field">
              <label htmlFor="description">Project summary</label>
              <textarea id="description" name="description" placeholder="What should the team deliver?" required />
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="programId">Program</label>
                <select id="programId" name="programId" defaultValue="">
                  <option value="">Unassigned program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="ownerId">Owner</label>
                <select id="ownerId" name="ownerId" defaultValue="">
                  <option value="">Select owner</option>
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
                <select id="status" name="status" defaultValue="On Track">
                  <option>On Track</option>
                  <option>Active</option>
                  <option>Needs Attention</option>
                  <option>Planning</option>
                  <option>Done</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="startDate">Start date</label>
                <input id="startDate" name="startDate" type="date" />
              </div>
              <div className="field">
                <label htmlFor="dueDate">Due date</label>
                <input id="dueDate" name="dueDate" type="date" />
              </div>
            </div>
            <button className="button" type="submit">
              Create project
            </button>
          </form>
        </article>

        <article className="panel panel--dark">
          <div className="section-header">
            <div className="section-title">
              <p className="eyebrow">Portfolio View</p>
              <h3>What leadership sees</h3>
            </div>
          </div>
          <div className="surface-grid">
            <div className="surface">
              <p className="muted">Tracked projects</p>
              <strong>{projects.length}</strong>
            </div>
            <div className="surface">
              <p className="muted">Imported workflows</p>
              <strong>{projects.filter((project) => project.imported).length}</strong>
            </div>
          </div>
          <p style={{ marginTop: 18 }}>
            Every project rolls up task state, owner clarity, and schedule pressure so you can spot stalled work
            before it becomes a delivery surprise.
          </p>
        </article>
      </section>

      <section className="card-grid">
        {projects.map((project) => {
          const doneCount = project.tasks.filter((task) => task.status === "Done").length;
          const progress = project.tasks.length ? Math.round((doneCount / project.tasks.length) * 100) : 0;

          return (
            <article key={project.id} className="list-card">
              <div className="section-header">
                <div className="section-title">
                  <p className="eyebrow">{project.priority} priority</p>
                  <h3>{project.title}</h3>
                </div>
                <StatusBadge
                  label={project.status}
                  tone={
                    project.status === "On Track" || project.status === "Active"
                      ? "good"
                      : project.status === "Needs Attention"
                        ? "critical"
                        : "warn"
                  }
                />
              </div>
              <p className="muted">{project.description}</p>
              <div className="meta-row" style={{ marginTop: 14 }}>
                <span>{project.program?.title ?? "No program"}</span>
                <span>{project.owner?.name ?? "No owner"}</span>
                <span>Due {formatDate(project.dueDate)}</span>
                <span>{project.tasks.length} tasks</span>
              </div>
              <div className="bar-row__track" style={{ marginTop: 18 }}>
                <div className="bar-row__fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="meta-row" style={{ marginTop: 10 }}>
                <span>{progress}% complete</span>
                <span>{doneCount} done</span>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
