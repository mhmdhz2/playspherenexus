// src/pages/admin/AdminAnalytics.jsx
import React, { useState, useEffect } from "react";
import { getAnalyticsSummary, getAllBookings, getZones } from "../../services/firebase";

export default function AdminAnalytics() {
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalyticsSummary(), getAllBookings(), getZones()])
      .then(([s, b, z]) => { setSummary(s); setBookings(b); setZones(z); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: "60px 0", color: "#A0A0C0" }}>Loading analytics…</div>;

  const zoneBookings = zones.map(z => ({
    ...z,
    bookings: bookings.filter(b => b.zoneId === z.id).length,
    revenue: bookings.filter(b => b.zoneId === z.id).reduce((s, b) => s + (b.totalPrice || 0), 0)
  })).sort((a, b) => b.bookings - a.bookings);

  const maxBookings = Math.max(...zoneBookings.map(z => z.bookings), 1);

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Analytics Dashboard 📊</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Bookings", value: summary?.totalBookings || 0, icon: "📅", color: "#FF6B35" },
          { label: "Total Users", value: summary?.totalUsers || 0, icon: "👥", color: "#a78bfa" },
          { label: "Total Orders", value: summary?.totalOrders || 0, icon: "🍔", color: "#06D6A0" },
          { label: "Total Revenue", value: `$${(summary?.totalRevenue || 0).toFixed(0)}`, icon: "💰", color: "#FFB703" },
        ].map(s => (
          <div key={s.label} style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 24, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#A0A0C0", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
       
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>🎡 Zone Popularity</div>
          {zoneBookings.length === 0 ? (
            <div style={{ color: "#A0A0C0", textAlign: "center", padding: "20px 0" }}>No booking data yet.</div>
          ) : (
            zoneBookings.map(z => (
              <div key={z.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{z.emoji} {z.name}</span>
                  <span style={{ fontSize: 12, color: "#A0A0C0" }}>{z.bookings} bookings · ${z.revenue}</span>
                </div>
                <div style={{ height: 8, background: "#1E1E35", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(z.bookings / maxBookings) * 100}%`, background: "linear-gradient(to right,#FF6B35,#e55a24)", borderRadius: 4, transition: "width 0.5s" }} />
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>📍 Live Occupancy</div>
          {zones.map(z => {
            const pct = Math.round((z.currentOccupancy / Math.max(z.capacity, 1)) * 100);
            return (
              <div key={z.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{z.emoji} {z.name}</span>
                  <span style={{ fontSize: 12, color: pct > 80 ? "#EF4444" : "#A0A0C0" }}>{z.currentOccupancy}/{z.capacity} ({pct}%)</span>
                </div>
                <div style={{ height: 8, background: "#1E1E35", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "#EF4444" : pct > 60 ? "#FFB703" : "#06D6A0", borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, gridColumn: "span 2" }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>📋 Recent Bookings</div>
          {bookings.length === 0 ? (
            <div style={{ color: "#A0A0C0", textAlign: "center", padding: "20px 0" }}>No bookings yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["User", "Zone", "Date", "Amount", "Status"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#A0A0C0", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 10).map((b, i) => (
                  <tr key={b.id} style={{ borderBottom: i < 9 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{b.userName || "—"}</td>
                    <td style={{ padding: "10px 12px" }}>{b.zoneEmoji} {b.zoneName}</td>
                    <td style={{ padding: "10px 12px", color: "#A0A0C0" }}>{b.date}</td>
                    <td style={{ padding: "10px 12px", color: "#06D6A0", fontWeight: 700 }}>${b.totalPrice}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ background: "rgba(6,214,160,0.15)", color: "#06D6A0", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
