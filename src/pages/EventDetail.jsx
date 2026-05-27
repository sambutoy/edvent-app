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
  const [newItem, setNewItem] = useState({ name: "", vendor: "", cost: "" });
  const [itemErrors, setItemErrors] = useState({});

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

    push({
      ...ev,
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
              assignees: [],
            },
          ],
        },
      },
    });
    addToast(`"${newItem.name}" added`);
    setNewItem({ name: "", vendor: "", cost: "" });
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
            <div key={item.id} className="item-row">
              <div style={{ minWidth: 0 }}>
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
              <div style={{ display: "flex", gap: 4 }}>
                {item.assignees.map((name) => <Avatar key={name} name={name} size={28} />)}
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => deleteItem(item.id)}
                aria-label={`Delete ${item.name}`}
                style={{ minHeight: 34, padding: 8 }}
              >
                <Icon name="trash" size={14} color={C.muted} />
              </button>
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Btn onClick={addItem}>Add Item</Btn>
              <Btn variant="secondary" onClick={() => { setAddingItem(false); setItemErrors({}); setNewItem({ name: "", vendor: "", cost: "" }); }}>
                Cancel
              </Btn>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
