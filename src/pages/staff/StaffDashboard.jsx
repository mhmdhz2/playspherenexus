// src/pages/staff/StaffDashboard.jsx
import React, { useState, useEffect } from "react";
import { subscribeToZones, getAllBookings } from "../../services/firebase";

export default function StaffDashboard() {
  const [zones, setZones] = useState([]);
  const [checkedInToday, setCheckedInToday] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);

  useEffect(() => {
    const unsub = subscribeToZones(setZones);
    // Get today's check-ins from bookings
    getAllBookings().then(bookings => {
      const today = new Date().toISOString().split("T")[0];
      const todayCheckins = bookings.filter(b => b.checkedIn && b.date === today);
      setCheckedInToday(todayCheckins.length);
      // Total visitors = sum of current occupancy across all zones
    }).catch(() => {});
    return unsub;
  }, []);

  useEffect(() => {
    const total = zones.reduce((s, z) => s + (z.currentOccupancy || 0), 0);
    setTotalVisitors(total);
  }, [zones]);

  const alerts = zones.filter(z => z.currentOccupancy / z.capacity >= 0.85 && z.status === "active");

  const Stat = ({ icon, val, label, color }) => (
    <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 26, marginBottom: 2 }}>{val}</div>
      <div style={{ fontSize: 13, color: "#A0A0C0" }}>{label}</div>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Staff Dashboard 🎯</h2>
      <p style={{ color: "#A0A0C0", fontSize: 14, marginBottom: 20 }}>Live park overview — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
        <Stat icon="✅" val={checkedInToday} label="Check-ins Today"   color="#06D6A0" />
        <Stat icon="👥" val={totalVisitors}   label="Visitors In Park"  color="#FF6B35" />
        <Stat icon="🎡" val={`${zones.filter(z => z.status === "active").length}/${zones.length}`} label="Zones Active" color="#a78bfa" />
        <Stat icon="🚨" val={alerts.length}   label="Zone Alerts"       color="#EF4444" />
      </div>

      {alerts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>⚠️ Zone Alerts</div>
          {alerts.map(z => (
            <div key={z.id} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 28 }}>{z.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, color: "#EF4444", fontSize: 15 }}>🚨 {z.name} — Near Capacity!</div>
                <div style={{ fontSize: 13, color: "#A0A0C0", marginTop: 2 }}>{z.currentOccupancy}/{z.capacity} children · Consider stopping new entries</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>🎡 Live Zone Overview</div>
        {zones.length === 0 ? (
          <div style={{ color: "#A0A0C0", textAlign: "center", padding: "20px 0" }}>Loading zones…</div>
        ) : (
          zones.map(z => (
            <div key={z.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize: 22, width: 30 }}>{z.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{z.name}</div>
                <div style={{ height: 5, background: "#2A2A45", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((z.currentOccupancy / z.capacity) * 100, 100)}%`, background: z.currentOccupancy / z.capacity >= 0.85 ? "#EF4444" : "#FF6B35", borderRadius: 3 }} />
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#A0A0C0", minWidth: 60, textAlign: "right" }}>{z.currentOccupancy}/{z.capacity}</div>
              <span style={{ background: z.status === "active" ? "rgba(6,214,160,0.15)" : "rgba(239,68,68,0.15)", color: z.status === "active" ? "#06D6A0" : "#EF4444", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, minWidth: 70, textAlign: "center" }}>
                {z.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
