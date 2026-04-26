// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { getAnalyticsSummary, getAllBookings, getZones, getSupportTickets } from "../../services/firebase";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [zones, setZones] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalyticsSummary(), getZones(), getSupportTickets(), getAllBookings()])
      .then(([s, z, t, b]) => {
        setSummary(s); setZones(z); setTickets(t); setRecentBookings(b.slice(0, 5));
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  const Stat = ({ icon, value, label, color }) => (
    <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 26, color }}>{loading ? "…" : value}</div>
      <div style={{ fontSize: 12, color: "#A0A0C0", marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Admin Dashboard 🛠️</h2>
      <p style={{ color: "#A0A0C0", fontSize: 14, marginBottom: 20 }}>Real-time overview of PlaySphere Nexus operations</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <Stat icon="📅" value={summary?.totalBookings || 0} label="Total Bookings" color="#FF6B35" />
        <Stat icon="👥" value={summary?.totalUsers || 0} label="Total Users" color="#a78bfa" />
        <Stat icon="🍔" value={summary?.totalOrders || 0} label="Food Orders" color="#06D6A0" />
        <Stat icon="💰" value={`$${(summary?.totalRevenue || 0).toFixed(0)}`} label="Total Revenue" color="#FFB703" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Zone status */}
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>🎡 Zone Status</div>
          {zones.length === 0 ? <div style={{ color: "#A0A0C0" }}>No zones found.</div> : zones.map(z => (
            <div key={z.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 16, marginRight: 8 }}>{z.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{z.name}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#A0A0C0" }}>{z.currentOccupancy}/{z.capacity}</span>
                <span style={{ background: z.status === "active" ? "rgba(6,214,160,0.15)" : "rgba(255,183,3,0.15)", color: z.status === "active" ? "#06D6A0" : "#FFB703", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{z.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Support tickets */}
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>🎫 Open Tickets ({tickets.filter(t => t.status === "open").length})</div>
          {tickets.filter(t => t.status === "open").slice(0, 5).length === 0 ? (
            <div style={{ color: "#A0A0C0", textAlign: "center", padding: "20px 0" }}>✓ No open tickets!</div>
          ) : (
            tickets.filter(t => t.status === "open").slice(0, 5).map(t => (
              <div key={t.id} style={{ background: "#1E1E35", borderRadius: 10, padding: 12, marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>🔧 {t.category || t.itemType}</div>
                <div style={{ fontSize: 12, color: "#A0A0C0", marginTop: 2 }}>{t.userName} · {t.id.slice(0, 8).toUpperCase()}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent bookings */}
      <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>📋 Recent Bookings</div>
        {recentBookings.length === 0 ? (
          <div style={{ color: "#A0A0C0", textAlign: "center", padding: "20px 0" }}>No bookings yet.</div>
        ) : (
          recentBookings.map(b => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1E1E35", borderRadius: 10, padding: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{b.zoneEmoji} {b.zoneName}</span>
                <span style={{ fontSize: 12, color: "#A0A0C0", marginLeft: 8 }}>by {b.userName}</span>
              </div>
              <div style={{ fontSize: 13, color: "#06D6A0", fontWeight: 700 }}>${b.totalPrice}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
