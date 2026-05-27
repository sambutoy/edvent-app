import { useRef, useState } from "react";
import { C } from "../constants/colors";
import { fmtDate, fmtPeso, getEventSpend } from "../constants/helpers";
import Icon from "../components/Icon";
import Badge from "../components/Badge";
import BudgetBar from "../components/BudgetBar";
import EmptyState from "../components/EmptyState";
import Btn from "../components/Btn";

function buildResults(events, q) {
  if (!q.trim()) return [];
  const query = q.toLowerCase();
  const results = [];

  for (const event of events) {
    if (event.name.toLowerCase().includes(query)) {
      results.push({
        type: "event",
        icon: "events",
        label: event.name,
        sub: `Client: ${event.client} - ${fmtDate(event.date)}`,
        status: event.status,
        event,
        budget: event.budget,
        spent: getEventSpend(event),
      });
      continue;
    }

    if (event.client.toLowerCase().includes(query)) {
      results.push({
        type: "client",
        icon: "user",
        label: event.client,
        sub: `Event: ${event.name} - ${fmtDate(event.date)}`,
        status: event.status,
        event,
      });
      continue;
    }

    for (const [catKey, category] of Object.entries(event.categories)) {
      for (const item of category.items) {
        if (
          item.name.toLowerCase().includes(query) ||
          (item.vendor && item.vendor.toLowerCase().includes(query))
        ) {
          results.push({
            type: "item",
            icon: catKey === "food" ? "food" : catKey === "sound" ? "sound" : "venue",
            label: item.name,
            sub: `${event.name} - ${item.vendor || "No vendor"} - ${fmtPeso(item.cost)}`,
            status: event.status,
            event,
            catLabel: category.label,
          });
        }
      }
    }
  }

  return results;
}

const TYPE_LABEL = { event: "Event", client: "Client", item: "Item" };
const TYPE_COLOR = { event: C.teal, client: C.navy, item: C.gold };

function highlight(text, query) {
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

export default function SearchResults({ events, initialQuery = "", onSelectEvent, onBack }) {
  const [inputVal, setInputVal] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const inputRef = useRef(null);
  const results = buildResults(events, submittedQuery);
  const typeGroups = ["event", "client", "item"];

  function handleSearch() {
    setSubmittedQuery(inputVal.trim());
  }

  return (
    <div className="content-stack">
      <section className="card list-toolbar">
        <div className="result-search-row">
          <div className="search-input-wrap is-focused" style={{ minWidth: 0 }}>
            <Icon name="search" size={16} color={C.teal} />
            <input
              ref={inputRef}
              className="search-input"
              value={inputVal}
              onChange={(event) => setInputVal(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSearch()}
              placeholder="Search events, clients, items, vendors..."
              autoFocus
            />
            {inputVal && (
              <button
                className="btn btn-ghost"
                onClick={() => { setInputVal(""); setSubmittedQuery(""); inputRef.current?.focus(); }}
                aria-label="Clear search"
                style={{ minHeight: 28, padding: 4 }}
              >
                <Icon name="close" size={15} color={C.muted} />
              </button>
            )}
          </div>
          <Btn onClick={handleSearch}>
            <Icon name="search" size={14} color="#fff" />
            Search
          </Btn>
        </div>
        <Btn variant="secondary" onClick={onBack}>
          <Icon name="back" size={14} color={C.text} />
          Dashboard
        </Btn>
      </section>

      {!submittedQuery.trim() ? (
        <div className="card">
          <EmptyState icon="search" message="Enter a keyword to search" sub="Events, clients, items, and vendors are indexed." />
        </div>
      ) : results.length === 0 ? (
        <div className="card">
          <EmptyState icon="search" message={`No results for "${submittedQuery}"`} sub="Try a different keyword." />
        </div>
      ) : (
        <>
          <section className="section-title-row">
            <p className="section-note">
              <strong style={{ color: C.navy }}>{results.length}</strong> result{results.length !== 1 ? "s" : ""} for{" "}
              <strong style={{ color: C.tealDark }}>{submittedQuery}</strong>
            </p>
            <div className="toolbar-summary">
              {typeGroups.map((type) => {
                const count = results.filter((result) => result.type === type).length;
                if (count === 0) return null;
                return (
                  <span
                    key={type}
                    className="chip"
                    style={{ color: TYPE_COLOR[type], borderColor: `${TYPE_COLOR[type]}35`, background: `${TYPE_COLOR[type]}12` }}
                  >
                    {TYPE_LABEL[type]}s: {count}
                  </span>
                );
              })}
            </div>
          </section>

          <section className="event-list">
            {results.map((result, idx) => (
              <article key={`${result.type}-${result.label}-${idx}`} className="card result-card" onClick={() => onSelectEvent(result.event)}>
                <div className="event-type-icon" style={{ background: `${TYPE_COLOR[result.type]}18` }}>
                  <Icon name={result.icon} size={18} color={TYPE_COLOR[result.type]} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <h2 className="event-name" style={{ margin: 0 }}>{highlight(result.label, submittedQuery)}</h2>
                    <span className="chip" style={{ minHeight: 24, padding: "3px 8px", color: TYPE_COLOR[result.type], borderColor: `${TYPE_COLOR[result.type]}35`, background: `${TYPE_COLOR[result.type]}12` }}>
                      {TYPE_LABEL[result.type]}
                    </span>
                    {result.catLabel && <span className="chip" style={{ minHeight: 24, padding: "3px 8px" }}>{result.catLabel}</span>}
                  </div>
                  <p className="suggestion-sub" style={{ whiteSpace: "normal" }}>
                    {highlight(result.sub, submittedQuery)}
                  </p>
                  {result.type === "event" && result.budget > 0 && (
                    <div style={{ maxWidth: 360 }}>
                      <BudgetBar spent={result.spent} total={result.budget} />
                    </div>
                  )}
                </div>

                <div className="event-right">
                  <Badge status={result.status} />
                  <Icon name="chevronR" size={16} color={C.muted} />
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
