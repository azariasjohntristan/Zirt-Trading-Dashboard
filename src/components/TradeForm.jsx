import { useState } from "react";

const SESSION_OPTIONS = [
  { value: 1, label: "London" },
  { value: 2, label: "NY" },
  { value: 3, label: "Asia" },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const emptyTrade = {
  date: todayStr(),
  session: 1,
  direction: "Buy",
  entry: "",
  exit: "",
  pnl: "",
  rr: "",
  result: "Win",
  emotion: 5,
  discipline: 5,
  notes: "",
};

export default function TradeForm({ phaseId, onSave, onClose }) {
  const [form, setForm] = useState({ ...emptyTrade });

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, [field]: val }));
  };

  const setNum = (field) => (e) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, [field]: val === "" ? "" : parseFloat(val) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trade = {
      date: form.date,
      session: form.session,
      direction: form.direction,
      entry: form.entry === "" ? 0 : parseFloat(form.entry),
      exit: form.exit === "" ? 0 : parseFloat(form.exit),
      pnl: form.pnl === "" ? 0 : parseFloat(form.pnl),
      rr: form.rr === "" ? 0 : parseFloat(form.rr),
      result: form.result,
      emotion: Math.min(10, Math.max(1, parseInt(form.emotion, 10) || 5)),
      discipline: Math.min(10, Math.max(1, parseInt(form.discipline, 10) || 5)),
      notes: form.notes.trim(),
    };
    onSave(phaseId, trade);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Log Trade</h2>
        <div className="modal-date">Phase: #{phaseId}</div>

        <form onSubmit={handleSubmit} className="trade-form">
          <div className="trade-form-grid">
            <label className="trade-form-field">
              <span className="tff-label">Date</span>
              <input type="date" value={form.date} onChange={set("date")} required />
            </label>
            <label className="trade-form-field">
              <span className="tff-label">Session</span>
              <select value={form.session} onChange={setNum("session")}>
                {SESSION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="trade-form-field">
              <span className="tff-label">Direction</span>
              <select value={form.direction} onChange={set("direction")}>
                <option value="Buy">Buy</option>
                <option value="Sell">Sell</option>
              </select>
            </label>
            <label className="trade-form-field">
              <span className="tff-label">Result</span>
              <select value={form.result} onChange={set("result")}>
                <option value="Win">Win</option>
                <option value="Loss">Loss</option>
                <option value="BE">BE</option>
              </select>
            </label>
            <label className="trade-form-field">
              <span className="tff-label">Entry</span>
              <input type="number" step="any" value={form.entry} onChange={set("entry")} placeholder="0" />
            </label>
            <label className="trade-form-field">
              <span className="tff-label">Exit</span>
              <input type="number" step="any" value={form.exit} onChange={set("exit")} placeholder="0" />
            </label>
            <label className="trade-form-field">
              <span className="tff-label">P&amp;L ($)</span>
              <input type="number" step="any" value={form.pnl} onChange={set("pnl")} placeholder="0.00" />
            </label>
            <label className="trade-form-field">
              <span className="tff-label">R:R</span>
              <input type="number" step="0.1" value={form.rr} onChange={set("rr")} placeholder="0" />
            </label>
            <label className="trade-form-field">
              <span className="tff-label">Emotion (1–10)</span>
              <input type="number" min="1" max="10" value={form.emotion} onChange={setNum("emotion")} />
            </label>
            <label className="trade-form-field">
              <span className="tff-label">Discipline (1–10)</span>
              <input type="number" min="1" max="10" value={form.discipline} onChange={setNum("discipline")} />
            </label>
          </div>
          <label className="trade-form-field trade-form-note">
            <span className="tff-label">Notes</span>
            <textarea value={form.notes} onChange={set("notes")} rows={3} />
          </label>
          <div className="tf-actions">
            <button type="button" className="tf-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="tf-save">Save Trade</button>
          </div>
        </form>
      </div>
    </div>
  );
}
