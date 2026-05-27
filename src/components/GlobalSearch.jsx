import { useEffect, useRef, useState } from "react";
import { C } from "../constants/colors";
import { fmtDate } from "../constants/helpers";
import Icon from "./Icon";
import Badge from "./Badge";

export default function GlobalSearch({ events, onSelectEvent, onSearch }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const shellRef = useRef(null);

  const suggestions = query.trim().length < 1 ? [] : (() => {
    const q = query.toLowerCase();
    const results = [];

    for (const event of events) {
      if (results.length >= 7) break;

      if (event.name.toLowerCase().includes(q)) {
        results.push({
          type: "event",
          label: event.name,
          sub: `Client: ${event.client}`,
          status: event.status,
          event,
          icon: "events",
        });
        continue;
      }

      if (event.client.toLowerCase().includes(q)) {
        results.push({
          type: "client",
          label: event.client,
          sub: event.name,
          status: event.status,
          event,
          icon: "user",
        });
        continue;
      }

      for (const [catKey, category] of Object.entries(event.categories)) {
        for (const item of category.items) {
          if (item.name.toLowerCase().includes(q) || (item.vendor || "").toLowerCase().includes(q)) {
            results.push({
              type: "item",
              label: item.name,
              sub: `${event.name} - ${item.vendor || "No vendor"}`,
              status: event.status,
              event,
              icon: catKey === "food" ? "food" : catKey === "sound" ? "sound" : "venue",
            });
            break;
          }
        }
        if (results.length >= 7) break;
      }
    }

    return results;
  })();

  const recent = !query.trim() && focused
    ? events.slice(0, 4).map((event) => ({
      type: "recent",
      label: event.name,
      sub: fmtDate(event.date),
      status: event.status,
      event,
      icon: "calendar",
    }))
    : [];

  const shown = query.trim() ? suggestions : recent;
  const showDrop = focused && shown.length > 0;
  const typeColor = { event: C.teal, client: C.navy, item: C.gold, recent: C.muted };
  const typeLabel = { event: "Event", client: "Client", item: "Item", recent: "Recent" };

  function select(item) {
    onSelectEvent(item.event);
    setQuery("");
    setFocused(false);
    setActiveIdx(-1);
  }

  function submitSearch() {
    setFocused(false);
    setActiveIdx(-1);
    onSearch?.(query);
  }

  function handleKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && showDrop) select(shown[activeIdx]);
      else submitSearch();
      return;
    }

    if (!showDrop) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((idx) => Math.min(idx + 1, shown.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((idx) => Math.max(idx - 1, -1));
    }
    if (e.key === "Escape") {
      setFocused(false);
      setQuery("");
      setActiveIdx(-1);
    }
  }

  useEffect(() => {
    function handleClick(event) {
      if (!shellRef.current?.contains(event.target)) {
        setFocused(false);
        setActiveIdx(-1);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function highlight(text) {
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

  return (
    <div className="search-shell" ref={shellRef}>
      <div
        className={`search-input-wrap ${focused ? "is-focused" : ""}`}
        onMouseDown={() => setFocused(true)}
      >
        <Icon name="search" size={16} color={focused ? C.teal : C.muted} />
        <input
          ref={inputRef}
          className="search-input"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIdx(-1); }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKey}
          placeholder="Search events, clients, items, vendors..."
        />
        {query && (
          <button
            className="btn btn-ghost"
            onClick={() => { setQuery(""); setActiveIdx(-1); inputRef.current?.focus(); }}
            aria-label="Clear search"
            style={{ minHeight: 28, padding: 4 }}
          >
            <Icon name="close" size={15} color={C.muted} />
          </button>
        )}
      </div>

      <button className="btn btn-primary" onClick={submitSearch} style={{ minWidth: 72 }}>
        <Icon name="search" size={14} color="#fff" />
        Search
      </button>

      {showDrop && (
        <div className="search-dropdown">
          {!query.trim() && <div className="search-group-label">Recent events</div>}
          {shown.map((item, idx) => (
            <button
              key={`${item.type}-${item.label}-${idx}`}
              className={`search-suggestion ${idx === activeIdx ? "is-active" : ""}`}
              onMouseDown={() => select(item)}
              onMouseEnter={() => setActiveIdx(idx)}
            >
              <span className="event-type-icon" style={{ width: 34, height: 34, background: `${typeColor[item.type]}18` }}>
                <Icon name={item.icon} size={15} color={typeColor[item.type]} />
              </span>
              <span style={{ minWidth: 0 }}>
                <p className="suggestion-label">{highlight(item.label)}</p>
                <p className="suggestion-sub">{highlight(item.sub)}</p>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="chip" style={{ minHeight: 24, padding: "3px 8px", color: typeColor[item.type], borderColor: `${typeColor[item.type]}35`, background: `${typeColor[item.type]}12` }}>
                  {typeLabel[item.type]}
                </span>
                <Badge status={item.status} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
