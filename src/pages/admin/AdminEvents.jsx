// src/pages/admin/AdminEvents.jsx
import React, { useState, useEffect } from "react";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../../services/firebase";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", emoji: "🎉", location: "Main Zone", date: "", time: "10:00", endTime: "12:00", capacity: 50, price: 25, isVIP: false, status: "upcoming" });

  const load = () => {
    setLoading(true);
    getEvents().then(e => { setEvents(e); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createEvent({ ...form, capacity: Number(form.capacity), price: Number(form.price) });
      setMsg({ type: "success", text: "Event created!" });
      setShowForm(false);
      setForm({ title: "", emoji: "🎉", location: "Main Zone", date: "", time: "10:00", endTime: "12:00", capacity: 50, price: 25, isVIP: false, status: "upcoming" });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      setMsg({ type: "success", text: "Event deleted." });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  };

  const inputSt = { width: "100%", padding: 10, background: "#1E1E35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#F0F0FF", fontSize: 14, boxSizing: "border-box", fontFamily: "'Nunito',sans-serif", outline: "none" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800 }}>Manage Events 🎉</h2>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: "10px 20px", background: "linear-gradient(135deg,#FF6B35,#e55a24)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          {showForm ? "✕ Cancel" : "+ New Event"}
        </button>
      </div>

      {msg.text && (
        <div style={{ background: msg.type === "success" ? "rgba(6,214,160,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${msg.type === "success" ? "rgba(6,214,160,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 10, padding: 12, marginBottom: 16, color: msg.type === "success" ? "#06D6A0" : "#f87171" }}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Create New Event</div>
          <form onSubmit={handleCreate}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#A0A0C0", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputSt} placeholder="Event title" required />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#A0A0C0", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Emoji</label>
                <input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} style={inputSt} placeholder="🎉" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#A0A0C0", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inputSt} required />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#A0A0C0", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputSt} required />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#A0A0C0", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Start Time</label>
                <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={inputSt} required />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#A0A0C0", display: "block", marginBottom: 6, textTransform: "uppercase" }}>End Time</label>
                <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} style={inputSt} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#A0A0C0", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Capacity</label>
                <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} style={inputSt} min={1} required />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#A0A0C0", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Price ($)</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inputSt} min={0} required />
              </div>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                <input type="checkbox" checked={form.isVIP} onChange={e => setForm({ ...form, isVIP: e.target.checked })} />
                👑 VIP Only Event
              </label>
            </div>
            <button type="submit" disabled={saving}
              style={{ marginTop: 16, padding: "11px 24px", background: saving ? "#2A2A45" : "linear-gradient(135deg,#FF6B35,#e55a24)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "default" : "pointer" }}>
              {saving ? "Creating…" : "Create Event →"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#A0A0C0" }}>Loading events…</div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#A0A0C0" }}>No events yet. Create one above!</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {events.map(e => {
            const left = (e.capacity || 0) - (e.seatsBooked || 0);
            const pct = Math.round(((e.seatsBooked || 0) / Math.max(e.capacity || 1, 1)) * 100);
            return (
              <div key={e.id} style={{ background: "#22223A", border: `1px solid ${e.isVIP ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 30 }}>{e.emoji}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {e.isVIP && <span style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>👑 VIP</span>}
                    <span style={{ background: "rgba(6,214,160,0.15)", color: "#06D6A0", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>{e.status}</span>
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{e.title}</div>
                <div style={{ fontSize: 13, color: "#A0A0C0", marginBottom: 2 }}>📍 {e.location}</div>
                <div style={{ fontSize: 13, color: "#A0A0C0", marginBottom: 8 }}>📅 {e.date} · {e.time} – {e.endTime}</div>
                <div style={{ height: 5, background: "#1E1E35", borderRadius: 4, marginBottom: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "#EF4444" : "#FF6B35", borderRadius: 4 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#A0A0C0", marginBottom: 12 }}>
                  <span>{e.seatsBooked || 0}/{e.capacity} booked</span>
                  <span style={{ color: "#06D6A0", fontWeight: 700 }}>${e.price}</span>
                </div>
                <button onClick={() => handleDelete(e.id)}
                  style={{ width: "100%", padding: "8px 0", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#EF4444", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  🗑 Delete Event
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
