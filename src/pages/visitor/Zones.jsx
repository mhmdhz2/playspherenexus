// src/pages/visitor/Zones.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getZones, subscribeToZones } from "../../services/firebase";

export default function Zones() {
  const [zones, setZones] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Real-time subscription to zone changes
    const unsub = subscribeToZones(setZones);
    return unsub;
  }, []);

  const statusBadge = (status, occ, cap) => {
    if (status === "maintenance") return { color: "#EF4444", bg: "rgba(239,68,68,0.15)", text: "⚠ Maintenance" };
    const pct = occ / cap;
    if (pct >= 0.9) return { color: "#EF4444", bg: "rgba(239,68,68,0.15)", text: "● Almost Full" };
    if (pct >= 0.7) return { color: "#FFB703", bg: "rgba(255,183,3,0.15)", text: "◑ Busy" };
    return { color: "#06D6A0", bg: "rgba(6,214,160,0.15)", text: "● Available" };
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Play Zones 🎡</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 16 }}>
        {zones.map(z => {
          const badge = statusBadge(z.status, z.currentOccupancy, z.capacity);
          return (
            <div key={z.id} style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 32 }}>{z.emoji}</span>
                <span style={{ background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, height: "fit-content" }}>{badge.text}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{z.name}</div>
              <div style={{ fontSize: 13, color: "#A0A0C0", marginBottom: 3 }}>Age group: <strong style={{ color: "#F0F0FF" }}>{z.minAge}–{z.maxAge} yrs</strong></div>
              <div style={{ fontSize: 13, color: "#A0A0C0", marginBottom: 3 }}>Min height: <strong style={{ color: "#F0F0FF" }}>{z.minHeight} cm</strong></div>
              <div style={{ fontSize: 13, color: "#A0A0C0", marginBottom: 3 }}>Capacity: <strong style={{ color: "#F0F0FF" }}>{z.currentOccupancy}/{z.capacity}</strong></div>
              {z.waitTime > 0 && <div style={{ fontSize: 13, color: "#FFB703" }}>Wait: ~{z.waitTime} min</div>}
              <div style={{ height: 6, background: "#2A2A45", borderRadius: 4, margin: "10px 0", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(z.currentOccupancy/z.capacity)*100}%`, background: badge.color, borderRadius: 4 }} />
              </div>
              <button onClick={() => z.status !== "maintenance" && navigate("/visitor/booking")}
                disabled={z.status === "maintenance"}
                style={{ width: "100%", padding: "10px", background: z.status === "maintenance" ? "#2A2A45" : "linear-gradient(135deg,#FF6B35,#e55a24)", border: "none", borderRadius: 10, color: z.status === "maintenance" ? "#6B6B8A" : "#fff", fontSize: 14, fontWeight: 700, cursor: z.status === "maintenance" ? "default" : "pointer" }}>
                {z.status === "maintenance" ? "Unavailable" : "Book Now →"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
