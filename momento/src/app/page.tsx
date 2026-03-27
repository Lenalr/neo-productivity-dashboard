import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
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
  }).format(date);
}

export default async function Home() {
  const { metrics, projects, programs, snapshots, productivityNarrative } = await getMomentoData();
  const hasWorkspace = programs.length > 0 || projects.length > 0 || metrics.totalTasks > 0;

  return (
    <div className="page-stack">
      <section className="hero">
        <div>
          <p className="eyebrow">Momento Executive Cockpit</p>
          <h2>Know if the team is productive in one glance.</h2>
          <p>
            {hasWorkspace
              ? "Momento gives NeoTechie a company-ready control center for programs, projects, tasks, ownership, and delivery health across NeoTechie."
              : "Start clean: add your team, create your first program, then build projects, tasks, and subtasks exactly the way your operation works."}
          </p>
          <div className="button-row" style={{ marginTop: 20 }}>
            <Link href="/tasks" className="button">
              Open task command center
            </Link>
            <Link href="/programs" className="button-secondary">
              Open program launchpad
            </Link>
          </div>
          <div className="button-row" style={{ marginTop: 18 }}>
            <span className="mobile-highlight">Phone-ready core actions</span>
            <span className="mobile-highlight">Microsoft login ready</span>
          </div>
        </div>
        <div className="hero__grid">
          <MetricCard
            label="Productivity Score"
            value={`${metrics.productivityScore}/100`}
            hint={metrics.productivityLabel}
            tone={metrics.productivityScore >= 75 ? "good" : metrics.productivityScore >= 55 ? "warn" : "critical"}
          />
          <MetricCard
            label="Completion Rate"
            value={`${metrics.completionRate}%`}
            hint={`${metrics.completedTasks} of ${metrics.totalTasks} tasks closed`}
            tone="good"
          />
          <MetricCard
            label="Overdue Work"
            value={String(metrics.overdueTasks)}
            hint={`${metrics.overdueRate}% of active workload`}
            tone={metrics.overdueTasks > 0 ? "critical" : "good"}
          />
          <MetricCard
            label="Active Programs"
            value={String(programs.length)}
            hint={`${metrics.activeProjects} projects currently moving`}
            tone="warn"
          />
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel panel--dark">
          <div className="panel__header">
            <div className="section-title">
              <p className="eyebrow">Leadership Summary</p>
              <h3>{metrics.productivityLabel} operating rhythm</h3>
            </div>
            <StatusBadge
              label={metrics.productivityLabel}
              tone={metrics.productivityScore >= 75 ? "good" : metrics.productivityScore >= 55 ? "warn" : "critical"}
            />
          </div>
          <p>{productivityNarrative}</p>
          <div className="surface-grid" style={{ marginTop: 20 }}>
            <div className="surface">
              <p className="muted">Execution in flight</p>
              <strong>{metrics.inFlightTasks} delivery items</strong>
            </div>
            <div className="surface">
              <p className="muted">Workload spread</p>
              <strong>{metrics.teamLoad.length} team members tracked</strong>
            </div>
          </div>
          {snapshots.length ? (
            <div className="trend-chart" style={{ marginTop: 24 }}>
              {snapshots.slice(-6).map((snapshot) => (
                <div key={snapshot.id} className="trend-chart__column">
                  <div className="trend-chart__bar" style={{ height: `${Math.max(48, snapshot.score * 1.4)}px` }} />
                  <strong>{snapshot.score}</strong>
                  <span className="muted">{formatDate(snapshot.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ marginTop: 24 }}>
              Productivity trends will appear once your team starts using Momento.
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel__header">
            <div className="section-title">
              <p className="eyebrow">Need Attention</p>
              <h3>Priority queue</h3>
            </div>
            <Link href="/tasks" className="button-secondary">
              View all
            </Link>
          </div>
          <div className="stack-list">
            {!metrics.topPriorityTasks.length && (
              <div className="empty-state">No active tasks yet. Add your first task with subtasks to start tracking execution.</div>
            )}
            {metrics.topPriorityTasks.map((task) => (
              <div key={task.id} className="stack-item">
                <div className="section-header" style={{ marginBottom: 0 }}>
                  <strong>{task.title}</strong>
                  <StatusBadge
                    label={task.status}
                    tone={task.status === "Done" ? "good" : task.status === "At Risk" ? "critical" : "warn"}
                  />
                </div>
                <div className="meta-row">
                  <span>{task.project?.title ?? "General"}</span>
                  <span>{task.assignee?.name ?? "Unassigned"}</span>
                  <span>Due {formatDate(task.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="two-column">
        <article className="list-card">
          <div className="section-header">
            <div className="section-title">
              <p className="eyebrow">Programs</p>
              <h3>Initiative health</h3>
            </div>
            <Link href="/programs" className="button-secondary">
              Manage programs
            </Link>
          </div>
          <div className="bar-list">
            {programs.map((program) => {
              const flattenedTasks = program.projects.flatMap((project) => project.tasks);
              const doneCount = flattenedTasks.filter((task) => task.status === "Done").length;
              const progress = flattenedTasks.length ? Math.round((doneCount / flattenedTasks.length) * 100) : 0;

              return (
                <div key={program.id} className="bar-row">
                  <div className="section-header" style={{ marginBottom: 0 }}>
                    <div>
                      <strong>{program.title}</strong>
                      <div className="meta-row">
                        <span>{program.owner?.name ?? "No owner"}</span>
                        <span>{program.projects.length} projects</span>
                      </div>
                    </div>
                    <StatusBadge
                      label={program.status}
                      tone={
                        program.status === "On Track" || program.status === "Active"
                          ? "good"
                          : program.status === "Needs Attention" || program.status === "At Risk"
                            ? "critical"
                            : "warn"
                      }
                    />
                  </div>
                  <div className="bar-row__track">
                    <div className="bar-row__fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="meta-row">
                    <span>{progress}% complete</span>
                    <span>{flattenedTasks.length} total tasks</span>
                    <span>{program.projects.length} linked projects</span>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="list-card">
          <div className="section-header">
            <div className="section-title">
              <p className="eyebrow">Project Stack</p>
              <h3>Linked delivery lanes</h3>
            </div>
            <Link href="/projects" className="button-secondary">
              Open projects
            </Link>
          </div>
          <div className="timeline">
            {projects.length ? (
              projects.slice(0, 4).map((project) => (
                <div key={project.id} className="timeline-item">
                  <div className="section-header" style={{ marginBottom: 0 }}>
                    <strong>{project.title}</strong>
                    <StatusBadge label={project.status} tone="good" />
                  </div>
                  <div className="meta-row">
                    <span>{project.program?.title ?? "No program"}</span>
                    <span>{project.tasks.length} tasks</span>
                    <span>{formatDate(project.dueDate)}</span>
                  </div>
                  <p className="muted">{project.description}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">No projects logged yet.</div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
