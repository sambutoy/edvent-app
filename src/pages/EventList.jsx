import { C } from "../constants/colors";
import { fmtDate, fmtPeso, getDaysUntil, getEventItemCount, getEventSpend } from "../constants/helpers";
import Icon from "../components/Icon";
import Badge from "../components/Badge";
import BudgetBar from "../components/BudgetBar";
import EmptyState from "../components/EmptyState";

const FILTER_LABEL = {
  all: "All",
  in_progress: "In Progress",
  unfinished: "Unfinished",
  completed: "Completed",
};

export default function EventList({ events, filter, onSelectEvent }) {
  const filtered = events
    .filter((event) => filter === "all" || event.status === filter)
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });

  const totalBudget = filtered.reduce((sum, event) => sum + (event.budget || 0), 0);
  const totalSpent = filtered.reduce((sum, event) => sum + getEventSpend(event), 0);
  const totalItems = filtered.reduce((sum, event) => sum + getEventItemCount(event), 0);

  if (filtered.length === 0) {
    return (
      <div className="card">
        <EmptyState icon="events" message="No events here" sub="Create a new event to start planning." />
      </div>
    );
  }

  return (
    <div className="content-stack">
      <section className="card list-toolbar">
        <div className="toolbar-summary">
          <span className="chip is-teal">
            <Icon name="events" size={14} color={C.tealDark} />
            {filtered.length} {FILTER_LABEL[filter]}
          </span>
          <span className="chip">
            <Icon name="folder" size={14} color={C.navy} />
            {totalItems} items
          </span>
          <span className="chip is-gold">
            <Icon name="budget" size={14} color={C.gold} />
            {fmtPeso(totalSpent)} spent
          </span>
        </div>
        <span className="section-note">{fmtPeso(totalBudget)} planned budget</span>
      </section>

      <section className="event-list">
        {filtered.map((event, index) => {
          const spent = getEventSpend(event);
          const itemCount = getEventItemCount(event);
          const days = getDaysUntil(event.date);
          const dateLabel = days === null
            ? "Date TBD"
            : days < 0
              ? "Past event"
              : days === 0
                ? "Today"
                : `${days} days out`;

          return (
            <article key={event.id} className="card event-card" onClick={() => onSelectEvent(event)}>
              <div className="event-index">{index + 1}</div>
              <div style={{ minWidth: 0 }}>
                <h2 className="event-name">{event.name}</h2>
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
                    <Icon name="box" size={12} color={C.muted} />
                    {itemCount} items
                  </span>
                  <span className="meta-item">
                    <Icon name="in_progress" size={12} color={C.muted} />
                    {dateLabel}
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
      </section>
    </div>
  );
}
