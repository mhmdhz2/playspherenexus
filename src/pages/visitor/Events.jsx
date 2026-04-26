// src/pages/visitor/Events.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getEvents, reserveEventSeat } from "../../services/firebase";

export default function Events() {
  const { currentUser, userProfile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [reserving, setReserving] = useState(null);

  const load = () => {
    setLoading(true);
    getEvents().then(e => { setEvents(e); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleReserve = async (event) => {
    if (!currentUser) { setMsg({ type: "error", text: "Please log in to reserve a seat." }); return; }
    setReserving(event.id);
    try {
      await reserveEventSeat(event.id, currentUser.uid, userProfile?.name || "Guest");
      setMsg({ type: "success", text: `✅ Seat reserved for "${event.title}"!` });
      load();
    } catch (err) {
      setMsg({ type: "error", text: `❌ ${err.message}` });
    }
    setReserving(null);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Events & Parties 🎉</h2>
      <p style={{ color: "#A0A0C0", fontSize: 14, marginBottom: 20 }}>Browse and reserve seats for upcoming events at PlaySphere Nexus</p>

      {msg.text && (
        <div style={{ background: msg.type === "success" ? "rgba(6,214,160,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${msg.type === "success" ? "rgba(6,214,160,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 10, padding: 14, marginBottom: 16, color: msg.type === "success" ? "#06D6A0" : "#f87171", fontWeight: 600 }}>
          {msg.text}
          <button onClick={() => setMsg({ type: "", text: "" })} style={{ float: "right", background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#A0A0C0" }}>Loading events…</div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#A0A0C0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <p>No events scheduled yet. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {events.map(e => {
            const left = (e.capacity || 0) - (e.seatsBooked || 0);
            const pct = Math.round(((e.seatsBooked || 0) / (e.capacity || 1)) * 100);
            return (
              <div key={e.id} style={{ background: "#22223A", border: `1px solid ${e.isVIP ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 36 }}>{e.emoji}</span>
                  <span style={{ background: e.isVIP ? "rgba(124,58,237,0.15)" : "rgba(6,214,160,0.15)", color: e.isVIP ? "#a78bfa" : "#06D6A0", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, height: "fit-content" }}>
                    {e.isVIP ? "👑 VIP Only" : "Public"}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{e.title}</div>
                <div style={{ fontSize: 13, color: "#A0A0C0", marginBottom: 2 }}>📍 {e.location}</div>
                <div style={{ fontSize: 13, color: "#A0A0C0", marginBottom: 2 }}>📅 {e.date} · {e.time} – {e.endTime}</div>
                <div style={{ fontSize: 13, color: left < 5 && left > 0 ? "#FFB703" : left === 0 ? "#EF4444" : "#A0A0C0", marginBottom: 10 }}>
                  🎟️ {left <= 0 ? "Sold out" : `${left} seats remaining`}
                </div>
                {/* Capacity bar */}
                <div style={{ height: 5, background: "#1E1E35", borderRadius: 4, marginBottom: 12, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "#EF4444" : "#FF6B35", borderRadius: 4 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: "#A0A0C0" }}>{pct}% full</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#06D6A0" }}>${e.price}</span>
                </div>
                {e.isVIP ? (
                  <button disabled style={{ width: "100%", padding: 10, background: "#2A2A45", border: "none", borderRadius: 10, color: "#6B6B8A", fontSize: 13, fontWeight: 700, cursor: "default" }}>
                    🔒 VIP Members Only
                  </button>
                ) : (
                  <button
                    onClick={() => handleReserve(e)}
                    disabled={left <= 0 || reserving === e.id}
                    style={{ width: "100%", padding: 10, background: left <= 0 ? "#2A2A45" : "linear-gradient(135deg,#FF6B35,#e55a24)", border: "none", borderRadius: 10, color: left <= 0 ? "#6B6B8A" : "#fff", fontSize: 13, fontWeight: 700, cursor: left <= 0 ? "default" : "pointer" }}>
                    {reserving === e.id ? "Reserving…" : left <= 0 ? "Sold Out" : `Reserve Seat — $${e.price}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
