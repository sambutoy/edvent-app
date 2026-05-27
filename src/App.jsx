import { useMemo, useState } from "react";
import { C } from "./constants/colors";
import { SEED } from "./constants/data";
import { fmtPeso, getEventSpend } from "./constants/helpers";
import { LogoSidebar } from "./components/Logo";
import Icon from "./components/Icon";
import Avatar from "./components/Avatar";
import GlobalSearch from "./components/GlobalSearch";
import Btn from "./components/Btn";
import { Toast } from "./components/Toast";
import { useToast } from "./components/useToast";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import EventList from "./pages/EventList";
import EventDetail from "./pages/EventDetail";
import NewEventModal from "./pages/NewEventModal";
import SearchResults from "./pages/SearchResults";

function MainApp({ username, onLogout }) {
  const [events, setEvents] = useState(SEED);
  const [page, setPage] = useState("dashboard");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { toasts, addToast } = useToast();

  const counts = useMemo(() => ({
    all: events.length,
    in_progress: events.filter((event) => event.status === "in_progress").length,
    unfinished: events.filter((event) => event.status === "unfinished").length,
    completed: events.filter((event) => event.status === "completed").length,
  }), [events]);

  const totalBudget = events.reduce((sum, event) => sum + (event.budget || 0), 0);
  const totalSpent = events.reduce((sum, event) => sum + getEventSpend(event), 0);
  const activeBudget = events
    .filter((event) => event.status !== "completed")
    .reduce((sum, event) => sum + (event.budget || 0), 0);

  function openSearch(q = "") {
    setSearchQuery(q);
    setPage("search_results");
  }

  function updateEvent(updated) {
    setEvents((prev) => prev.map((event) => (event.id === updated.id ? updated : event)));
  }

  function createEvent(event) {
    setEvents((prev) => [...prev, event]);
    setShowNewEvent(false);
    addToast(`"${event.name}" created`);
    setSelectedEvent(event);
    setPage("event_detail");
  }

  function selectEvent(event) {
    setSelectedEvent(event);
    setPage("event_detail");
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "events", label: "All Events", icon: "events", count: counts.all },
    { key: "in_progress", label: "In Progress", icon: "in_progress", count: counts.in_progress },
    { key: "unfinished", label: "Pending", icon: "unfinished", count: counts.unfinished },
    { key: "completed", label: "Completed", icon: "completed", count: counts.completed },
  ];

  const pageMeta = {
    dashboard: {
      kicker: "Operations",
      title: "Event command center",
      subtitle: "Track budgets, upcoming work, and event status from one place.",
    },
    events: {
      kicker: "Portfolio",
      title: "All events",
      subtitle: "Scan every event, budget, client, and planning state.",
    },
    in_progress: {
      kicker: "Portfolio",
      title: "In progress",
      subtitle: "Events currently moving through planning and execution.",
    },
    unfinished: {
      kicker: "Portfolio",
      title: "Pending",
      subtitle: "Drafts and pending events that still need planning work.",
    },
    completed: {
      kicker: "Archive",
      title: "Completed",
      subtitle: "Closed events with their final spend and item records.",
    },
    search_results: {
      kicker: "Search",
      title: searchQuery ? `Results for "${searchQuery}"` : "Search results",
      subtitle: "Jump quickly to matching events, clients, items, and vendors.",
    },
    event_detail: {
      kicker: "Event",
      title: selectedEvent?.name || "Event detail",
      subtitle: selectedEvent?.client || "Event workspace",
    },
  }[page];

  const showPageHeader = page !== "event_detail";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-control-row">
            <button
              className="sidebar-toggle"
              onClick={() => setCollapsed((value) => !value)}
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
            >
              <span className="hamburger" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
          <div className="brand-mark">
            <LogoSidebar collapsed={collapsed} />
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          <p className="nav-section-title">Workspace</p>
          {!collapsed && (
            <div className="workspace-card">
              <strong>{counts.in_progress + counts.unfinished} active events</strong>
              <span>{fmtPeso(activeBudget)} planned across current work.</span>
            </div>
          )}

          {navItems.map((item) => {
            const active = page === item.key || (item.key === "events" && page === "event_detail");
            return (
              <button
                key={item.key}
                className={`nav-item ${active ? "is-active" : ""}`}
                onClick={() => {
                  setPage(item.key);
                  if (item.key !== "event_detail") setSelectedEvent(null);
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon name={item.icon} size={18} color={active ? "#fff" : "rgba(238,242,248,0.72)"} />
                <span className="nav-label">{item.label}</span>
                {item.count !== undefined && <span className="nav-count">{item.count}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item logout-button" onClick={() => setShowLogoutConfirm(true)} title={collapsed ? "Logout" : undefined}>
            <Icon name="logout" size={17} color="currentColor" />
            <span className="nav-label logout-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="topbar">
          {page === "event_detail" && (
            <button className="back-button" onClick={() => { setPage("events"); setSelectedEvent(null); }}>
              <Icon name="back" size={14} color={C.tealDark} />
              Back
            </button>
          )}

          <div className="topbar-title">
            <span className="topbar-eyebrow">{pageMeta.kicker}</span>
            <strong>{pageMeta.title}</strong>
          </div>

          <GlobalSearch events={events} onSelectEvent={selectEvent} onSearch={openSearch} />

          {page !== "event_detail" && (
            <Btn onClick={() => setShowNewEvent(true)}>
              <Icon name="add" size={14} color="#fff" />
              New Event
            </Btn>
          )}

          <Avatar name={username} size={36} />
        </header>

        <div className="page-scroll">
          <div className="page-frame">
            {showPageHeader && (
              <section className="page-header">
                <div>
                  <p className="page-kicker">{pageMeta.kicker}</p>
                  <h1 className="page-title">{pageMeta.title}</h1>
                  <p className="page-subtitle">{pageMeta.subtitle}</p>
                </div>
                <div className="header-actions">
                  <span className="chip is-teal">
                    <Icon name="in_progress" size={14} color={C.tealDark} />
                    {counts.in_progress} live
                  </span>
                  <span className="chip is-gold">
                    <Icon name="budget" size={14} color={C.gold} />
                    {fmtPeso(totalSpent)} spent
                  </span>
                  <span className="chip">
                    <Icon name="events" size={14} color={C.navy} />
                    {fmtPeso(totalBudget)} total budget
                  </span>
                </div>
              </section>
            )}

            {page === "dashboard" && <Dashboard events={events} onSelectEvent={selectEvent} />}
            {(page === "events" || page === "in_progress" || page === "unfinished" || page === "completed") && (
              <EventList events={events} filter={page === "events" ? "all" : page} onSelectEvent={selectEvent} />
            )}
            {page === "search_results" && (
              <SearchResults
                events={events}
                initialQuery={searchQuery}
                onSelectEvent={selectEvent}
                onBack={() => setPage("dashboard")}
              />
            )}
            {page === "event_detail" && selectedEvent && (
              <EventDetail
                event={events.find((event) => event.id === selectedEvent.id) || selectedEvent}
                onUpdate={updateEvent}
                onBack={() => { setPage("events"); setSelectedEvent(null); }}
                addToast={addToast}
              />
            )}
          </div>
        </div>
      </main>

      {showNewEvent && <NewEventModal onClose={() => setShowNewEvent(false)} onCreate={createEvent} />}

      {/* ── LOGOUT CONFIRM MODAL ── */}
      {showLogoutConfirm && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(27,58,107,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20,
          backdropFilter: "blur(3px)",
        }}>
          <div style={{
            background: "#fff", borderRadius: 18,
            padding: "32px 28px", width: "100%", maxWidth: 380,
            boxShadow: "0 16px 60px rgba(27,58,107,0.22)",
            animation: "fadeUp 0.2s ease",
            fontFamily: "'Inter', system-ui, sans-serif",
            textAlign: "center",
          }}>
            {/* Icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "#FDECEA",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px",
            }}>
              <Icon name="logout" size={22} color="#C0392B" />
            </div>

            <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: "#1B3A6B", letterSpacing: -0.2 }}>
              Log out?
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6B7A8D", fontWeight: 500, lineHeight: 1.5 }}>
              You'll be returned to the login screen. Any unsaved changes will be lost.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1, padding: "11px", borderRadius: 9,
                  border: "1.5px solid #DDE3EA", background: "#fff",
                  fontSize: 13, fontWeight: 600, color: "#1B2B45",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#F2F5F8"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLogoutConfirm(false); onLogout(); }}
                style={{
                  flex: 1, padding: "11px", borderRadius: 9,
                  border: "none", background: "#C0392B",
                  fontSize: 13, fontWeight: 700, color: "#fff",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "filter 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.9)"}
                onMouseLeave={e => e.currentTarget.style.filter = "none"}
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} />
    </div>
  );
}

export default function EdVent() {
  const [user, setUser] = useState(null);
  if (!user) return <LoginPage onLogin={setUser} />;
  return <MainApp username={user} onLogout={() => setUser(null)} />;
}
