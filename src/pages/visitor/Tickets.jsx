// src/pages/visitor/Tickets.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserBookings } from "../../services/firebase";
import { QRCodeSVG } from "qrcode.react";

const BADGE = {
  confirmed: { bg: "rgba(6,214,160,0.15)",  color: "#06D6A0",  text: "✓ Confirmed"  },
  pending:   { bg: "rgba(255,183,3,0.15)",   color: "#FFB703",  text: "⏳ Pending"   },
  completed: { bg: "rgba(96,165,250,0.15)",  color: "#60a5fa",  text: "✓ Completed" },
  cancelled: { bg: "rgba(239,68,68,0.15)",   color: "#EF4444",  text: "✗ Cancelled" },
};

export default function Tickets() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    getUserBookings(currentUser.uid)
      .then(b => { setBookings(b); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currentUser]);

  const active = bookings.find(b => b.status === "confirmed" && !b.checkedIn);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "#A0A0C0" }}>Loading tickets…</div>
  );

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>My Tickets & QR Codes 📲</h2>
      <p style={{ color: "#A0A0C0", fontSize: 14, marginBottom: 20 }}>Your booking tickets and QR codes for park entry</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Active QR */}
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>🎟️ Active Ticket</div>
          {active ? (
            <>
              <div style={{ background: "#1E1E35", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{active.zoneEmoji} {active.zoneName}</div>
                <div style={{ color: "#A0A0C0", fontSize: 13 }}>{active.date} · {active.time}</div>
                {active.childName && active.childName !== "—" && <div style={{ color: "#A0A0C0", fontSize: 13 }}>Child: {active.childName}</div>}
                <div style={{ color: "#06D6A0", fontSize: 13, fontWeight: 700, marginTop: 4 }}>${active.totalPrice}</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 12, padding: 12, display: "inline-block", marginBottom: 12 }}>
                <QRCodeSVG value={active.qrCode} size={160} level="H" />
              </div>
              <div style={{ fontSize: 12, color: "#A0A0C0", marginBottom: 6 }}>Scan at the entrance gate</div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "#6B6B8A", letterSpacing: 2 }}>{active.qrCode}</div>
              <div style={{ marginTop: 12 }}>
                <span style={{ background: "rgba(6,214,160,0.15)", color: "#06D6A0", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>✓ Valid Ticket</span>
              </div>
            </>
          ) : (
            <div style={{ color: "#A0A0C0", padding: "40px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
              <p style={{ fontSize: 14 }}>No active tickets. Book a session to get your QR code!</p>
            </div>
          )}
        </div>

        {/* All tickets */}
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>📋 All Tickets ({bookings.length})</div>
          {bookings.length === 0 ? (
            <div style={{ color: "#A0A0C0", textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
              <p style={{ fontSize: 14 }}>No bookings yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 400, overflowY: "auto" }}>
              {bookings.map(b => {
                const badge = BADGE[b.status] || BADGE.confirmed;
                return (
                  <div key={b.id} onClick={() => setSelected(selected?.id === b.id ? null : b)}
                    style={{ background: selected?.id === b.id ? "#2A2A45" : "#1E1E35", borderRadius: 10, padding: 14, cursor: "pointer", border: `1px solid ${selected?.id === b.id ? "rgba(255,107,53,0.3)" : "transparent"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{b.zoneEmoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{b.zoneName}</div>
                        <div style={{ fontSize: 12, color: "#A0A0C0" }}>{b.date} · {b.time} · ${b.totalPrice}</div>
                      </div>
                      <span style={{ background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>{badge.text}</span>
                    </div>
                    {selected?.id === b.id && (
                      <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
                        <div style={{ background: "#fff", borderRadius: 8, padding: 8 }}>
                          <QRCodeSVG value={b.qrCode} size={100} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
