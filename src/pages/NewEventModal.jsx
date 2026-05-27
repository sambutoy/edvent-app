import { useState } from "react";
import { C } from "../constants/colors";
import Field from "../components/Field";
import Input from "../components/Input";
import Btn from "../components/Btn";
import Icon from "../components/Icon";

export default function NewEventModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", date: "", client: "", budget: "" });
  const [errors, setErrors] = useState({});

  function set(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  }

  function submit() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Event name is required.";
    if (form.budget && isNaN(form.budget)) nextErrors.budget = "Budget must be a number.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onCreate({
      id: Date.now(),
      name: form.name.trim(),
      status: "unfinished",
      date: form.date,
      client: form.client.trim() || "Unassigned",
      budget: Number(form.budget) || 0,
      categories: {
        food: { label: "Food", items: [] },
        sound: { label: "Sound", items: [] },
        venue: { label: "Venue", items: [] },
      },
    });
  }

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="new-event-title">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2 id="new-event-title" className="modal-title">Create event</h2>
            <p className="modal-subtitle">Set the event record and budget baseline.</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close modal" style={{ minHeight: 34, padding: 8 }}>
            <Icon name="close" size={17} color={C.muted} />
          </button>
        </div>

        <Field label="Event name" error={errors.name}>
          <Input
            value={form.name}
            onChange={(event) => set("name", event.target.value)}
            placeholder="Maria's Debut Party"
            error={errors.name}
            autoFocus
          />
        </Field>

        <div className="form-grid">
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(event) => set("date", event.target.value)} />
          </Field>
          <Field label="Total budget" error={errors.budget}>
            <Input
              value={form.budget}
              onChange={(event) => set("budget", event.target.value)}
              placeholder="80000"
              error={errors.budget}
            />
          </Field>
        </div>

        <Field label="Client name">
          <Input
            value={form.client}
            onChange={(event) => set("client", event.target.value)}
            placeholder="Maria Santos"
          />
        </Field>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Btn onClick={submit} style={{ flex: 1 }}>
            <Icon name="add" size={14} color="#fff" />
            Create Event
          </Btn>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}
