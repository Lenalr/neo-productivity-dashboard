import { createProgramAction } from "@/app/actions";
import { StatusBadge } from "@/components/status-badge";
import { getMomentoData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const { programs, users } = await getMomentoData();

  return (
    <div className="page-stack">
      <section className="section-header">
        <div className="section-title">
          <p className="eyebrow">Programs</p>
          <h2>Group work by company initiative</h2>
        </div>
      </section>

      <section className="two-column">
        <article className="form-card">
          <div className="section-header">
            <div className="section-title">
              <p className="eyebrow">Create</p>
              <h3>Add a program</h3>
            </div>
          </div>
          <form action={createProgramAction}>
            <div className="field">
              <label htmlFor="title">Program title</label>
              <input id="title" name="title" placeholder="Ex: Client Delivery Systems" required />
            </div>
            <div className="field">
              <label htmlFor="description">Program summary</label>
              <textarea id="description" name="description" placeholder="What strategic initiative does this program own?" required />
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="ownerId">Program owner</label>
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
                <label htmlFor="status">Status</label>
                <select id="status" name="status" defaultValue="Active">
                  <option>Active</option>
                  <option>Planning</option>
                  <option>At Risk</option>
                  <option>Paused</option>
                </select>
              </div>
            </div>
            <button className="button" type="submit">
              Create program
            </button>
          </form>
        </article>

        <article className="panel panel--dark">
          <div className="section-header">
            <div className="section-title">
              <p className="eyebrow">Hierarchy</p>
              <h3>Native Momento structure</h3>
            </div>
          </div>
          <div className="stack-list">
            <div className="surface">
              <strong>Program</strong>
              <p className="muted">Big company initiative or operating stream.</p>
            </div>
            <div className="surface">
              <strong>Project</strong>
              <p className="muted">A concrete delivery effort inside a program.</p>
            </div>
            <div className="surface">
              <strong>Task and subtask</strong>
              <p className="muted">Execution units for day-to-day ownership and progress.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="card-grid">
        {!programs.length && <article className="empty-state">No programs yet. Start here, then connect projects, tasks, and subtasks underneath.</article>}
        {programs.map((program) => {
          const taskCount = program.projects.reduce((sum, project) => sum + project.tasks.length, 0);
          const doneCount = program.projects.reduce(
            (sum, project) => sum + project.tasks.filter((task) => task.status === "Done").length,
            0,
          );
          const progress = taskCount ? Math.round((doneCount / taskCount) * 100) : 0;

          return (
            <article key={program.id} className="list-card">
              <div className="section-header">
                <div className="section-title">
                  <p className="eyebrow">{program.owner?.name ?? "No owner"}</p>
                  <h3>{program.title}</h3>
                </div>
                <StatusBadge
                  label={program.status}
                  tone={program.status === "Active" ? "good" : program.status === "At Risk" ? "critical" : "warn"}
                />
              </div>
              <p className="muted">{program.description}</p>
              <div className="meta-row" style={{ marginTop: 14 }}>
                <span>{program.projects.length} projects</span>
                <span>{taskCount} tasks</span>
                <span>{doneCount} done</span>
              </div>
              <div className="bar-row__track" style={{ marginTop: 18 }}>
                <div className="bar-row__fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="meta-row" style={{ marginTop: 10 }}>
                <span>{progress}% completion</span>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
