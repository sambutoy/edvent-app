import { useEffect, useState } from "react";
import { C } from "../constants/colors";
import { fmtDate, fmtPeso, getEventItemCount, getEventSpend } from "../constants/helpers";
import Icon from "../components/Icon";
import Avatar from "../components/Avatar";
import Badge from "../components/Badge";
import BudgetBar from "../components/BudgetBar";
import Btn from "../components/Btn";
import Field from "../components/Field";
import Input from "../components/Input";
import EmptyState from "../components/EmptyState";

const CAT_ICONS = { food: "food", sound: "sound", venue: "venue" };

export default function EventDetail({ event, onUpdate, addToast }) {
  const [ev, setEv] = useState(event);
  const [activeTab, setActiveTab] = useState(Object.keys(event.categories)[0]);
  const [addingItem, setAddingItem] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: event.name,
    date: event.date,
    client: event.client,
    budget: event.budget || "",
  });
  const [editErrors, setEditErrors] = useState({});
  const [newItem, setNewItem] = useState({ name: "", vendor: "", cost: "", assignees: [] });
  const [newAssignInput, setNewAssignInput] = useState("");
  const [itemErrors, setItemErrors] = useState({});
  const [editingItemId, setEditingItemId] = useState(null);
  const [editItemForm, setEditItemForm] = useState({ name: "", vendor: "", cost: "" });
  const [editItemErrors, setEditItemErrors] = useState({});
  const [assigningItemId, setAssigningItemId] = useState(null);
  const [assignInput, setAssignInput] = useState("");

  useEffect(() => {
    setEv(event);
    setEditForm({
      name: event.name,
      date: event.date,
      client: event.client,
      budget: event.budget || "",
    });
    if (!event.categories[activeTab]) {
      setActiveTab(Object.keys(event.categories)[0]);
    }
  }, [event, activeTab]);

  function push(updated) {
    setEv(updated);
    onUpdate(updated);
  }

  function saveEdit() {
    const nextErrors = {};
    if (!editForm.name.trim()) nextErrors.name = "Event name is required.";
    if (editForm.budget && isNaN(editForm.budget)) nextErrors.budget = "Budget must be a number.";
    if (Object.keys(nextErrors).length) {
      setEditErrors(nextErrors);
      return;
    }

    push({
      ...ev,
      name: editForm.name.trim(),
      date: editForm.date,
      client: editForm.client.trim() || "Unassigned",
      budget: Number(editForm.budget) || 0,
    });
    setEditing(false);
    addToast("Event details updated");
  }

  function changeStatus(val) {
    push({ ...ev, status: val });
    addToast(`Status changed to ${C.STATUS[val].label}`);
  }

  function addItem() {
    const nextErrors = {};
    if (!newItem.name.trim()) nextErrors.name = "Item name is required.";
    if (newItem.cost && isNaN(newItem.cost)) nextErrors.cost = "Cost must be a number.";
    if (Object.keys(nextErrors).length) {
      setItemErrors(nextErrors);
      return;
    }

    const wasUnfinished = ev.status === "unfinished";

    push({
      ...ev,
      status: wasUnfinished ? "in_progress" : ev.status,
      categories: {
        ...ev.categories,
        [activeTab]: {
          ...ev.categories[activeTab],
          items: [
            ...ev.categories[activeTab].items,
            {
              id: Date.now(),
              name: newItem.name.trim(),
              vendor: newItem.vendor.trim(),
              cost: Number(newItem.cost) || 0,
              assignees: newItem.assignees,
            },
          ],
        },
      },
    });
    addToast(`"${newItem.name}" added`);
    if (wasUnfinished) addToast("Status updated to In Progress", "info");
    setNewItem({ name: "", vendor: "", cost: "", assignees: [] });
    setNewAssignInput("");
    setItemErrors({});
    setAddingItem(false);
  }

  function deleteItem(id) {
    push({
      ...ev,
      categories: {
        ...ev.categories,
        [activeTab]: {
          ...ev.categories[activeTab],
          items: ev.categories[activeTab].items.filter((item) => item.id !== id),
        },
      },
    });
    addToast("Item removed", "info");
  }

  function startEditItem(item) {
    setEditingItemId(item.id);
    setEditItemForm({ name: item.name, vendor: item.vendor, cost: item.cost === 0 ? "" : String(item.cost) });
    setEditItemErrors({});
    setAddingItem(false);
  }

  function saveEditItem() {
    const errs = {};
    if (!editItemForm.name.trim()) errs.name = "Item name is required.";
    if (editItemForm.cost && isNaN(editItemForm.cost)) errs.cost = "Cost must be a number.";
    if (Object.keys(errs).length) { setEditItemErrors(errs); return; }
    push({
      ...ev,
      categories: {
        ...ev.categories,
        [activeTab]: {
          ...ev.categories[activeTab],
          items: ev.categories[activeTab].items.map((item) =>
            item.id === editingItemId
              ? { ...item, name: editItemForm.name.trim(), vendor: editItemForm.vendor.trim(), cost: Number(editItemForm.cost) || 0 }
              : item
          ),
        },
      },
    });
    addToast("Item updated");
    setEditingItemId(null);
    setEditItemErrors({});
  }

  function addAssignee(itemId) {
    const name = assignInput.trim();
    if (!name) return;
    const item = ev.categories[activeTab].items.find(i => i.id === itemId);
    if (item.assignees.includes(name)) { setAssignInput(""); return; }
    push({
      ...ev,
      categories: {
        ...ev.categories,
        [activeTab]: {
          ...ev.categories[activeTab],
          items: ev.categories[activeTab].items.map(i =>
            i.id === itemId ? { ...i, assignees: [...i.assignees, name] } : i
          ),
        },
      },
    });
    addToast(`${name} assigned`);
    setAssignInput("");
    setAssigningItemId(null);
  }

  function removeAssignee(itemId, name) {
    push({
      ...ev,
      categories: {
        ...ev.categories,
        [activeTab]: {
          ...ev.categories[activeTab],
          items: ev.categories[activeTab].items.map(i =>
            i.id === itemId ? { ...i, assignees: i.assignees.filter(a => a !== name) } : i
          ),
        },
      },
    });
    addToast(`${name} removed`, "info");
  }

  const totalItems = getEventItemCount(ev);
  const spent = getEventSpend(ev);
  const remaining = (ev.budget || 0) - spent;
  const cat = ev.categories[activeTab];

  return (
    <div className="content-stack">
      <section className="card detail-hero">
        {editing ? (
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="section-title-row">
              <h2 className="section-title">Edit event details</h2>
              <Badge status={ev.status} />
            </div>
            <div className="form-grid">
              <Field label="Event name" error={editErrors.name}>
                <Input
                  value={editForm.name}
                  onChange={(event) => {
                    setEditForm((prev) => ({ ...prev, name: event.target.value }));
                    setEditErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  error={editErrors.name}
                />
              </Field>
              <Field label="Date">
                <Input
                  type="date"
                  value={editForm.date}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, date: event.target.value }))}
                />
              </Field>
              <Field label="Client">
                <Input
                  value={editForm.client}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, client: event.target.value }))}
                  placeholder="Client name"
                />
              </Field>
              <Field label="Total budget" error={editErrors.budget}>
                <Input
                  value={editForm.budget}
                  onChange={(event) => {
                    setEditForm((prev) => ({ ...prev, budget: event.target.value }));
                    setEditErrors((prev) => ({ ...prev, budget: "" }));
                  }}
                  placeholder="150000"
                  error={editErrors.budget}
                />
              </Field>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Btn onClick={saveEdit}>Save Changes</Btn>
              <Btn variant="secondary" onClick={() => { setEditing(false); setEditErrors({}); }}>Cancel</Btn>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="section-title-row">
                <Badge status={ev.status} />
                <span className="section-note">{totalItems} planned items</span>
              </div>
              <h1 className="detail-title">{ev.name}</h1>
              <div className="meta-row">
                <span className="meta-item">
                  <Icon name="user" size={13} color={C.muted} />
                  {ev.client}
                </span>
                <span className="meta-item">
                  <Icon name="calendar" size={13} color={C.muted} />
                  {fmtDate(ev.date)}
                </span>
                <span className="meta-item">
                  <Icon name="budget" size={13} color={remaining < 0 ? C.danger : C.teal} />
                  {remaining >= 0 ? `${fmtPeso(remaining)} remaining` : `${fmtPeso(Math.abs(remaining))} over budget`}
                </span>
              </div>
              {ev.budget > 0 && (
                <div style={{ maxWidth: 560, marginTop: 18 }}>
                  <BudgetBar spent={spent} total={ev.budget} />
                </div>
              )}
            </div>
            <div className="detail-actions">
              <select className="select" value={ev.status} onChange={(event) => changeStatus(event.target.value)}>
                <option value="in_progress">In Progress</option>
                <option value="unfinished">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <Btn variant="secondary" onClick={() => setEditing(true)}>
                <Icon name="edit" size={13} color={C.text} />
                Edit Details
              </Btn>
              {ev.status !== "completed" && (
                <Btn
                  onClick={() => { changeStatus("completed"); }}
                  style={{ background: "#0B7A6E", border: "none", color: "#fff", boxShadow: "0 2px 8px rgba(11,122,110,0.3)" }}
                >
                  <Icon name="completed" size={14} color="#fff" />
                  Mark as Completed
                </Btn>
              )}
            </div>
          </>
        )}
      </section>

      <section className="detail-metrics">
        {[
          { label: "Total Items", value: totalItems, icon: "box", color: C.navy, bg: C.navyLight },
          { label: "Total Spent", value: fmtPeso(spent), icon: "budget", color: C.gold, bg: C.goldLight },
          { label: "Budget", value: fmtPeso(ev.budget || 0), icon: "budget", color: C.teal, bg: C.tealLight },
          { label: "Categories", value: Object.keys(ev.categories).length, icon: "folder", color: C.coral, bg: C.coralLight },
        ].map((metric) => (
          <article key={metric.label} className="card mini-metric">
            <div className="metric-icon" style={{ background: metric.bg }}>
              <Icon name={metric.icon} size={15} color={metric.color} />
            </div>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </section>

      <section className="tabs" aria-label="Event categories">
        {Object.entries(ev.categories).map(([key, category]) => (
          <button
            key={key}
            className={`tab ${activeTab === key ? "is-active" : ""}`}
            onClick={() => { setActiveTab(key); setAddingItem(false); }}
          >
            <Icon name={CAT_ICONS[key] || "folder"} size={14} color={activeTab === key ? C.teal : C.muted} />
            {category.label}
            <span className="pill-count" style={{ background: activeTab === key ? C.teal : C.border, color: activeTab === key ? "#fff" : C.muted }}>
              {category.items.length}
            </span>
          </button>
        ))}
      </section>

      <section className="card items-panel">
        <div className="items-panel-header">
          <div className="items-title">
            <Icon name={CAT_ICONS[activeTab] || "folder"} size={16} color={C.navy} />
            {cat.label} items
          </div>
          <Btn onClick={() => { setAddingItem(true); setItemErrors({}); }}>
            <Icon name="add" size={13} color="#fff" />
            Add Item
          </Btn>
        </div>

        {cat.items.length === 0 && !addingItem ? (
          <EmptyState
            icon={CAT_ICONS[activeTab] || "folder"}
            message={`No ${cat.label.toLowerCase()} items yet`}
            sub="Add an item to build this category."
          />
        ) : (
          cat.items.map((item) => (
            <div key={item.id}>
              {editingItemId === item.id ? (
                /* ── Inline edit form ── */
                <div className="item-form">
                  <div className="item-form-grid">
                    <Field label="Item" error={editItemErrors.name}>
                      <Input
                        value={editItemForm.name}
                        onChange={(e) => { setEditItemForm((p) => ({ ...p, name: e.target.value })); setEditItemErrors((p) => ({ ...p, name: "" })); }}
                        placeholder="Item name"
                        error={editItemErrors.name}
                        autoFocus
                      />
                    </Field>
                    <Field label="Vendor">
                      <Input
                        value={editItemForm.vendor}
                        onChange={(e) => setEditItemForm((p) => ({ ...p, vendor: e.target.value }))}
                        placeholder="Vendor or supplier"
                      />
                    </Field>
                    <Field label="Cost" error={editItemErrors.cost}>
                      <Input
                        value={editItemForm.cost}
                        onChange={(e) => { setEditItemForm((p) => ({ ...p, cost: e.target.value })); setEditItemErrors((p) => ({ ...p, cost: "" })); }}
                        placeholder="12000"
                        error={editItemErrors.cost}
                      />
                    </Field>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <Btn onClick={saveEditItem}>Save Changes</Btn>
                    <Btn variant="secondary" onClick={() => { setEditingItemId(null); setEditItemErrors({}); }}>Cancel</Btn>
                  </div>
                </div>
              ) : (
                /* ── Normal item row ── */
                <div className="item-row">
                  <div className="item-row-content">
                    <p className="item-name">{item.name}</p>
                    <div className="meta-row">
                      {item.vendor && (
                        <span className="meta-item">
                          <Icon name="vendor" size={11} color={C.muted} />
                          {item.vendor}
                        </span>
                      )}
                      <span className="meta-item" style={{ color: item.cost > 0 ? C.tealDark : C.muted }}>
                        <Icon name="budget" size={11} color={item.cost > 0 ? C.tealDark : C.muted} />
                        {fmtPeso(item.cost)}
                      </span>
                    </div>
                  </div>

                  {/* Assignees */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    {item.assignees.map((name) => (
                      <div key={name} style={{ position: "relative" }}>
                        <button
                          title={`Remove ${name}`}
                          onClick={() => removeAssignee(item.id, name)}
                          onMouseEnter={e => { e.currentTarget.querySelector('.assignee-overlay').style.opacity = 1; }}
                          onMouseLeave={e => { e.currentTarget.querySelector('.assignee-overlay').style.opacity = 0; }}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", borderRadius: "50%", position: "relative" }}
                        >
                          <Avatar name={name} size={36} />
                          <div className="assignee-overlay" style={{
                            position: "absolute", inset: 0, borderRadius: "50%",
                            background: "rgba(192,57,43,0.85)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            opacity: 0, transition: "opacity 0.15s",
                            pointerEvents: "none",
                          }}>
                            <Icon name="trash" size={14} color="#fff" />
                          </div>
                        </button>
                      </div>
                    ))}

                    {/* Assign popover */}
                    {assigningItemId === item.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input
                          autoFocus
                          value={assignInput}
                          onChange={e => setAssignInput(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") addAssignee(item.id); if (e.key === "Escape") { setAssigningItemId(null); setAssignInput(""); } }}
                          placeholder="Name"
                          style={{
                            width: 110, padding: "5px 9px", fontSize: 12,
                            border: `1.5px solid ${C.teal}`, borderRadius: 7,
                            outline: "none", fontFamily: "inherit", color: C.text,
                            boxShadow: `0 0 0 3px ${C.tealLight}`,
                          }}
                        />
                        <button
                          onClick={() => addAssignee(item.id)}
                          style={{ background: C.teal, border: "none", borderRadius: 7, cursor: "pointer", padding: "5px 10px", color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}
                        >Add</button>
                        <button
                          onClick={() => { setAssigningItemId(null); setAssignInput(""); }}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", borderRadius: 6 }}
                        ><Icon name="close" size={13} color={C.muted} /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAssigningItemId(item.id); setAssignInput(""); setEditingItemId(null); }}
                        title="Assign person"
                        style={{
                          width: 36, height: 36, borderRadius: "50%",
                          border: `1.5px dashed ${C.border}`,
                          background: "transparent", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "border-color 0.15s, background 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.background = C.tealLight; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "transparent"; }}
                      >
                        <Icon name="add" size={14} color={C.muted} />
                      </button>
                    )}
                  </div>

                  <div className="item-row-actions">
                    <button
                      className="item-action-btn"
                      onClick={() => startEditItem(item)}
                      aria-label={`Edit ${item.name}`}
                      title="Edit item"
                    >
                      <Icon name="edit" size={15} color={C.navy} />
                    </button>
                    <button
                      className="item-action-btn danger"
                      onClick={() => deleteItem(item.id)}
                      aria-label={`Delete ${item.name}`}
                      title="Delete item"
                    >
                      <Icon name="trash" size={15} color={C.danger} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {addingItem && (
          <div className="item-form">
            <div className="item-form-grid">
              <Field label="Item" error={itemErrors.name}>
                <Input
                  value={newItem.name}
                  onChange={(event) => {
                    setNewItem((prev) => ({ ...prev, name: event.target.value }));
                    setItemErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="Item name"
                  error={itemErrors.name}
                  autoFocus
                />
              </Field>
              <Field label="Vendor">
                <Input
                  value={newItem.vendor}
                  onChange={(event) => setNewItem((prev) => ({ ...prev, vendor: event.target.value }))}
                  placeholder="Vendor or supplier"
                />
              </Field>
              <Field label="Cost" error={itemErrors.cost}>
                <Input
                  value={newItem.cost}
                  onChange={(event) => {
                    setNewItem((prev) => ({ ...prev, cost: event.target.value }));
                    setItemErrors((prev) => ({ ...prev, cost: "" }));
                  }}
                  placeholder="12000"
                  error={itemErrors.cost}
                />
              </Field>
            </div>

            {/* Assignees in add form */}
            <Field label="Assignees">
              <div style={{
                width: "100%", padding: "8px 10px",
                border: `1.5px solid ${C.border}`, borderRadius: 9,
                display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
                background: C.white, transition: "border-color 0.15s, box-shadow 0.15s",
                minHeight: 42,
              }}
                onFocusCapture={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.tealLight}`; }}
                onBlurCapture={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
              >
                {newItem.assignees.map(name => (
                  <button
                    key={name}
                    title={`Remove ${name}`}
                    onClick={() => setNewItem(p => ({ ...p, assignees: p.assignees.filter(a => a !== name) }))}
                    onMouseEnter={e => { e.currentTarget.querySelector('.assignee-overlay').style.opacity = 1; }}
                    onMouseLeave={e => { e.currentTarget.querySelector('.assignee-overlay').style.opacity = 0; }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", borderRadius: "50%", position: "relative", flexShrink: 0 }}
                  >
                    <Avatar name={name} size={28} />
                    <div className="assignee-overlay" style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      background: "rgba(192,57,43,0.85)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: 0, transition: "opacity 0.15s",
                      pointerEvents: "none",
                    }}>
                      <Icon name="trash" size={12} color="#fff" />
                    </div>
                  </button>
                ))}
                <input
                  value={newAssignInput}
                  onChange={e => setNewAssignInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const name = newAssignInput.trim();
                      if (name && !newItem.assignees.includes(name)) {
                        setNewItem(p => ({ ...p, assignees: [...p.assignees, name] }));
                      }
                      setNewAssignInput("");
                    }
                  }}
                  placeholder={newItem.assignees.length === 0 ? "Type a name and press Enter" : "Add another..."}
                  style={{
                    flex: 1, minWidth: 120, padding: "2px 4px",
                    border: "none", outline: "none",
                    fontSize: 13, fontFamily: "inherit", color: C.text,
                    background: "transparent",
                  }}
                />
              </div>
            </Field>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Btn onClick={addItem}>Add Item</Btn>
              <Btn variant="secondary" onClick={() => { setAddingItem(false); setItemErrors({}); setNewItem({ name: "", vendor: "", cost: "", assignees: [] }); setNewAssignInput(""); }}>
                Cancel
              </Btn>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
