import { createUserAction } from "@/app/actions";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { getMomentoData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const { metrics, users, tasks } = await getMomentoData();

  return (
    <div className="page-stack">
      <section className="section-header">
        <div className="section-title">
          <p className="eyebrow">Team</p>
          <h2>Ownership, workload, and momentum</h2>
        </div>
      </section>

      <section className="kpi-grid">
        <MetricCard label="Tracked teammates" value={String(users.length)} hint="Internal NeoTechie members" />
        <MetricCard label="Assignments" value={String(tasks.filter((task) => task.assigneeId).length)} hint="Owned work items" />
        <MetricCard label="Done tasks" value={String(metrics.completedTasks)} hint="Closed this cycle" tone="good" />
        <MetricCard label="Overdue tasks" value={String(metrics.overdueTasks)} hint="Needs intervention" tone="critical" />
      </section>

      <section className="two-column">
        <article className="form-card">
          <div className="section-header">
            <div className="section-title">
              <p className="eyebrow">People</p>
              <h3>Add teammate</h3>
            </div>
          </div>
          <form action={createUserAction}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" placeholder="Ex: Angel" required />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="angel@neotechie.in" required />
              </div>
              <div className="field">
                <label htmlFor="role">Role</label>
                <input id="role" name="role" placeholder="Automation Engineer" required />
              </div>
              <div className="field">
                <label htmlFor="team">Team</label>
                <input id="team" name="team" placeholder="Automation" required />
              </div>
            </div>
            <button className="button" type="submit">
              Add teammate
            </button>
          </form>
        </article>

        <article className="list-card">
          <div className="section-header">
            <div className="section-title">
              <p className="eyebrow">Team Load</p>
              <h3>Who owns what right now</h3>
            </div>
          </div>
          {!metrics.teamLoad.length && (
            <div className="empty-state">No teammates yet. Add your team first so tasks and subtasks can be assigned properly.</div>
          )}
          {metrics.teamLoad.map((entry) => (
            <div key={entry.user.id} className="team-row">
              <div className="section-header" style={{ marginBottom: 0 }}>
                <div>
                  <strong>{entry.user.name}</strong>
                  <div className="meta-row">
                    <span>{entry.user.role}</span>
                    <span>{entry.user.team}</span>
                  </div>
                </div>
                <StatusBadge
                  label={`${entry.completionRate}% completion`}
                  tone={entry.completionRate >= 70 ? "good" : entry.completionRate >= 40 ? "warn" : "critical"}
                />
              </div>
              <div className="surface-grid">
                <div className="surface">
                  <p className="muted">Assigned</p>
                  <strong>{entry.assigned}</strong>
                </div>
                <div className="surface">
                  <p className="muted">Done</p>
                  <strong>{entry.done}</strong>
                </div>
                <div className="surface">
                  <p className="muted">Overdue</p>
                  <strong>{entry.overdue}</strong>
                </div>
              </div>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
}
