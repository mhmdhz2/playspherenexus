// src/pages/admin/AdminBookings.jsx
import React, { useState, useEffect } from "react";
import { getAllBookings } from "../../services/firebase";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getAllBookings()
      .then(b => { setBookings(b); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      (b.userName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.zoneName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.qrCode || "").includes(search.toUpperCase());
    const matchFilter = filter === "all" || b.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    checkedIn: bookings.filter(b => b.checkedIn).length,
    revenue: bookings.reduce((s, b) => s + (b.totalPrice || 0), 0)
  };

  const BADGE = {
    confirmed: { bg: "rgba(6,214,160,0.15)",  color: "#06D6A0", text: "Confirmed"  },
    cancelled: { bg: "rgba(239,68,68,0.15)",   color: "#EF4444", text: "Cancelled"  },
    completed: { bg: "rgba(96,165,250,0.15)",  color: "#60a5fa", text: "Completed"  },
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Manage Bookings 📅</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Bookings", value: stats.total,                        color: "#FF6B35" },
          { label: "Confirmed",      value: stats.confirmed,                    color: "#06D6A0" },
          { label: "Checked In",     value: stats.checkedIn,                    color: "#a78bfa" },
          { label: "Revenue",        value: `$${stats.revenue.toFixed(0)}`,     color: "#FFB703" },
        ].map(s => (
          <div key={s.label} style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{loading ? "…" : s.value}</div>
            <div style={{ fontSize: 12, color: "#A0A0C0", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by user, zone, or QR code…"
          style={{ flex: 1, padding: "10px 14px", background: "#1E1E35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#F0F0FF", fontSize: 14, fontFamily: "'Nunito',sans-serif", outline: "none" }} />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: "10px 14px", background: "#1E1E35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#F0F0FF", fontSize: 14 }}>
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#A0A0C0" }}>Loading bookings…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#A0A0C0" }}>No bookings found.</div>
      ) : (
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["User", "Zone", "Date & Time", "Price", "QR Code", "Status", "Checked In"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#A0A0C0", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => {
                const badge = BADGE[b.status] || BADGE.confirmed;
                return (
                  <tr key={b.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>{b.userName || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>{b.zoneEmoji} {b.zoneName}</td>
                    <td style={{ padding: "12px 16px", color: "#A0A0C0" }}>{b.date} {b.time?.slice(0,5)}</td>
                    <td style={{ padding: "12px 16px", color: "#06D6A0", fontWeight: 700 }}>${b.totalPrice}</td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11, color: "#6B6B8A" }}>{(b.qrCode || "").slice(0, 16)}…</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>{badge.text}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ color: b.checkedIn ? "#06D6A0" : "#6B6B8A", fontWeight: 700 }}>{b.checkedIn ? "✓ Yes" : "—"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
