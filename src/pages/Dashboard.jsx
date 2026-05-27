import { C } from "../constants/colors";
import { fmtDate, fmtPeso, getBudgetPercent, getDaysUntil, getEventItemCount, getEventSpend } from "../constants/helpers";
import Icon from "../components/Icon";
import Badge from "../components/Badge";
import BudgetBar from "../components/BudgetBar";
import EmptyState from "../components/EmptyState";
import Btn from "../components/Btn";

function statusRows(events) {
  const total = Math.max(events.length, 1);
  return [
    { key: "in_progress", label: "In Progress", color: C.sky },
    { key: "unfinished", label: "Unfinished", color: C.gold },
    { key: "completed", label: "Completed", color: C.teal },
  ].map((row) => {
    const count = events.filter((event) => event.status === row.key).length;
    return { ...row, count, pct: Math.round((count / total) * 100) };
  });
}

export default function Dashboard({ events, onSelectEvent }) {
  const active = events.filter((event) => event.status !== "completed");
  const done = events.filter((event) => event.status === "completed");
  const totalBudget = events.reduce((sum, event) => sum + (event.budget || 0), 0);
  const totalSpent = events.reduce((sum, event) => sum + getEventSpend(event), 0);
  const allItems = events.reduce((sum, event) => sum + getEventItemCount(event), 0);

  const upcoming = [...events]
    .filter((event) => event.date && event.status !== "completed")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const priority = upcoming[0] || active[0] || events[0];
  const prioritySpent = priority ? getEventSpend(priority) : 0;
  const priorityDays = priority ? getDaysUntil(priority.date) : null;

  const stats = [
    {
      label: "Active Events",
      value: active.length,
      note: `${done.length} completed`,
      icon: "in_progress",
      color: C.sky,
      bg: C.skyLight,
    },
    {
      label: "Total Budget",
      value: fmtPeso(totalBudget),
      note: `${getBudgetPercent(totalSpent, totalBudget)}% allocated`,
      icon: "budget",
      color: C.teal,
      bg: C.tealLight,
    },
    {
      label: "Total Spent",
      value: fmtPeso(totalSpent),
      note: `${fmtPeso(Math.max(totalBudget - totalSpent, 0))} remaining`,
      icon: "box",
      color: C.gold,
      bg: C.goldLight,
    },
    {
      label: "Planned Items",
      value: allItems,
      note: `${events.length} event records`,
      icon: "folder",
      color: C.coral,
      bg: C.coralLight,
    },
  ];

  return (
    <div className="content-stack">
      <section className="metric-grid">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="card metric-card"
            style={{ "--accent": stat.color, "--accent-bg": stat.bg }}
          >
            <div className="metric-top">
              <p className="metric-label">{stat.label}</p>
              <div className="metric-icon">
                <Icon name={stat.icon} size={17} color={stat.color} />
              </div>
            </div>
            <p className="metric-value">{stat.value}</p>
            <p className="metric-note">{stat.note}</p>
          </article>
        ))}
      </section>

      {priority && (
        <section className="card priority-panel">
          <div>
            <div className="section-title-row">
              <h2 className="section-title">Priority event</h2>
              <Badge status={priority.status} />
            </div>
            <h3 className="priority-title">{priority.name}</h3>
            <div className="meta-row">
              <span className="meta-item">
                <Icon name="calendar" size={13} color={C.muted} />
                {fmtDate(priority.date)}
              </span>
              <span className="meta-item">
                <Icon name="user" size={13} color={C.muted} />
                {priority.client}
              </span>
              <span className="meta-item">
                <Icon name="folder" size={13} color={C.muted} />
                {getEventItemCount(priority)} items
              </span>
            </div>
            {priority.budget > 0 && (
              <div style={{ maxWidth: 520, marginTop: 18 }}>
                <BudgetBar spent={prioritySpent} total={priority.budget} />
              </div>
            )}
          </div>
          <div className="priority-side">
            <div className="compact-stat">
              <span>Event date</span>
              <strong>{priorityDays === null ? "TBD" : priorityDays < 0 ? "Past" : `${priorityDays} days`}</strong>
            </div>
            <div className="compact-stat">
              <span>Budget</span>
              <strong>{fmtPeso(priority.budget || 0)}</strong>
            </div>
            <div className="compact-stat">
              <span>Spent</span>
              <strong>{fmtPeso(prioritySpent)}</strong>
            </div>
            <Btn onClick={() => onSelectEvent(priority)} style={{ width: "100%" }}>
              Open Event
              <Icon name="chevronR" size={14} color="#fff" />
            </Btn>
          </div>
        </section>
      )}

      <section className="dashboard-grid">
        <div>
          <div className="section-title-row">
            <h2 className="section-title">Upcoming events</h2>
            <span className="section-note">{upcoming.length} scheduled</span>
          </div>

          {upcoming.length === 0 ? (
            <div className="card">
              <EmptyState icon="calendar" message="No upcoming events" sub="Create an event to begin planning." />
            </div>
          ) : (
            <div className="event-list">
              {upcoming.map((event, index) => {
                const spent = getEventSpend(event);
                return (
                  <article key={event.id} className="card event-card" onClick={() => onSelectEvent(event)}>
                    <div className="event-index">{index + 1}</div>
                    <div style={{ minWidth: 0 }}>
                      <h3 className="event-name">{event.name}</h3>
                      <div className="meta-row">
                        <span className="meta-item">
                          <Icon name="calendar" size={12} color={C.muted} />
                          {fmtDate(event.date)}
                        </span>
                        <span className="meta-item">
                          <Icon name="user" size={12} color={C.muted} />
                          {event.client}
                        </span>
                        <span className="meta-item">
                          <Icon name="budget" size={12} color={C.muted} />
                          {fmtPeso(spent)}
                        </span>
                      </div>
                      {event.budget > 0 && <BudgetBar spent={spent} total={event.budget} />}
                    </div>
                    <div className="event-right">
                      <Badge status={event.status} />
                      <Icon name="chevronR" size={15} color={C.muted} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="card side-panel">
          <div className="section-title-row">
            <h2 className="section-title">Portfolio health</h2>
            <span className="section-note">{events.length} total</span>
          </div>
          <div className="status-stack">
            {statusRows(events).map((row) => (
              <div key={row.key} className="status-row">
                <span className="status-label">{row.label}</span>
                <span className="section-note">{row.count}</span>
                <div className="status-bar">
                  <div className="status-fill" style={{ width: `${row.pct}%`, "--accent": row.color }} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
