// src/pages/admin/AdminZones.jsx
import React, { useState, useEffect } from "react";
import { subscribeToZones, updateZoneStatus, updateZoneOccupancy } from "../../services/firebase";

export default function AdminZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const unsub = subscribeToZones((z) => { setZones(z); setLoading(false); });
    return unsub;
  }, []);

  const handleStatus = async (zoneId, status) => {
    await updateZoneStatus(zoneId, status);
    setMsg(`Zone status updated to ${status}`);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleOccupancy = async (zoneId, val) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0) await updateZoneOccupancy(zoneId, num);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Manage Play Zones 🎡</h2>
      {msg && <div style={{ background: "rgba(6,214,160,0.12)", border: "1px solid rgba(6,214,160,0.3)", borderRadius: 10, padding: 12, marginBottom: 16, color: "#06D6A0" }}>✅ {msg}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#A0A0C0" }}>Loading zones…</div>
      ) : zones.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#A0A0C0" }}>No zones found.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {zones.map(z => {
            const pct = Math.round((z.currentOccupancy / Math.max(z.capacity, 1)) * 100);
            return (
              <div key={z.id} style={{ background: "#22223A", border: `1px solid ${z.status === "maintenance" ? "rgba(255,183,3,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 32 }}>{z.emoji}</span>
                  <span style={{ background: z.status === "active" ? "rgba(6,214,160,0.15)" : "rgba(255,183,3,0.15)", color: z.status === "active" ? "#06D6A0" : "#FFB703", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
                    {z.status}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>{z.name}</div>
                <div style={{ fontSize: 13, color: "#A0A0C0", marginBottom: 4 }}>Ages {z.minAge}–{z.maxAge} · Min height: {z.minHeight}cm</div>
                <div style={{ fontSize: 13, color: "#A0A0C0", marginBottom: 12 }}>${z.pricePerHour}/hr · Capacity: {z.capacity}</div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: "#A0A0C0" }}>Current Occupancy</span>
                    <span style={{ color: pct > 80 ? "#EF4444" : "#F0F0FF", fontWeight: 700 }}>{z.currentOccupancy}/{z.capacity} ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: "#1E1E35", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "#EF4444" : pct > 60 ? "#FFB703" : "#06D6A0", borderRadius: 4 }} />
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#A0A0C0", display: "block", marginBottom: 6 }}>ADJUST OCCUPANCY</label>
                  <input type="number" defaultValue={z.currentOccupancy} min={0} max={z.capacity}
                    onBlur={e => handleOccupancy(z.id, e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", background: "#1E1E35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F0F0FF", fontSize: 14, boxSizing: "border-box" }} />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleStatus(z.id, "active")} disabled={z.status === "active"}
                    style={{ flex: 1, padding: "8px 0", background: z.status === "active" ? "#2A2A45" : "rgba(6,214,160,0.12)", border: `1px solid ${z.status === "active" ? "transparent" : "rgba(6,214,160,0.3)"}`, borderRadius: 8, color: z.status === "active" ? "#6B6B8A" : "#06D6A0", fontSize: 12, fontWeight: 700, cursor: z.status === "active" ? "default" : "pointer" }}>
                    ✓ Active
                  </button>
                  <button onClick={() => handleStatus(z.id, "maintenance")} disabled={z.status === "maintenance"}
                    style={{ flex: 1, padding: "8px 0", background: z.status === "maintenance" ? "#2A2A45" : "rgba(255,183,3,0.12)", border: `1px solid ${z.status === "maintenance" ? "transparent" : "rgba(255,183,3,0.3)"}`, borderRadius: 8, color: z.status === "maintenance" ? "#6B6B8A" : "#FFB703", fontSize: 12, fontWeight: 700, cursor: z.status === "maintenance" ? "default" : "pointer" }}>
                    🔧 Maintenance
                  </button>
                  <button onClick={() => handleStatus(z.id, "closed")} disabled={z.status === "closed"}
                    style={{ flex: 1, padding: "8px 0", background: z.status === "closed" ? "#2A2A45" : "rgba(239,68,68,0.12)", border: `1px solid ${z.status === "closed" ? "transparent" : "rgba(239,68,68,0.3)"}`, borderRadius: 8, color: z.status === "closed" ? "#6B6B8A" : "#EF4444", fontSize: 12, fontWeight: 700, cursor: z.status === "closed" ? "default" : "pointer" }}>
                    ✕ Close
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
