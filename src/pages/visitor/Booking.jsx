// src/pages/visitor/Booking.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getZones, getChildProfiles, createBooking, redeemPoints } from "../../services/firebase";

const C = { card: { background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 } };

const TIME_SLOTS = [
  { value: "09:00", label: "09:00 – 10:00 AM" },
  { value: "10:00", label: "10:00 – 11:00 AM" },
  { value: "11:00", label: "11:00 – 12:00 PM" },
  { value: "13:00", label: "01:00 – 02:00 PM" },
  { value: "14:00", label: "02:00 – 03:00 PM" },
  { value: "15:00", label: "03:00 – 04:00 PM" },
  { value: "16:00", label: "04:00 – 05:00 PM" },
  { value: "17:00", label: "05:00 – 06:00 PM" },
];

export default function Booking() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [children, setChildren] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [selected, setSelected] = useState({ zone: null, date: "", time: "09:00", childId: "", payment: "card" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getZones()
      .then(z => { setZones(z.filter(z => z.status === "active")); setZonesLoading(false); })
      .catch(() => setZonesLoading(false));
    if (currentUser) getChildProfiles(currentUser.uid).then(setChildren);
  }, [currentUser]);

  const selectedZone = zones.find(z => z.id === selected.zone);
  const loyaltyPoints = userProfile?.loyaltyPoints || 0;
  const loyaltyDiscount = loyaltyPoints >= 100 ? 5 : 0;
  const total = selectedZone ? Math.max(0, selectedZone.pricePerHour - loyaltyDiscount) : 0;
  const today = new Date().toISOString().split("T")[0];

  const handleBook = async () => {
    if (!selected.zone)  { setError("Please select a play zone."); return; }
    if (!selected.date)  { setError("Please select a date."); return; }
    if (selected.date < today) { setError("Please select a future date."); return; }
    setError(""); setLoading(true);
    try {
      const child = children.find(c => c.id === selected.childId);
      const bookingId = await createBooking({
        userId:         currentUser.uid,
        userName:       userProfile.name,
        zoneId:         selected.zone,
        zoneName:       selectedZone.name,
        zoneEmoji:      selectedZone.emoji,
        childId:        selected.childId || null,
        childName:      child?.name || "—",
        date:           selected.date,
        time:           selected.time,
        duration:       60,
        basePrice:      selectedZone.pricePerHour,
        loyaltyDiscount,
        totalPrice:     total,
        paymentMethod:  selected.payment,
        checkedIn:      false,
      });
      if (loyaltyDiscount > 0) {
        await redeemPoints(currentUser.uid, 100, "$5 booking discount");
      }
      if (refreshProfile) await refreshProfile();
      setSuccess(`Booking confirmed! ID: ${bookingId.slice(0, 8).toUpperCase()} — redirecting to your ticket…`);
      setTimeout(() => navigate("/visitor/tickets"), 2500);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Book a Session 📅</h2>
      <p style={{ color: "#A0A0C0", marginBottom: 24, fontSize: 14 }}>Select a zone, date, and time slot — your QR ticket will be ready instantly</p>

      {success && <div style={{ background: "rgba(6,214,160,0.12)", border: "1px solid rgba(6,214,160,0.3)", borderRadius: 10, padding: 14, marginBottom: 16, color: "#06D6A0", fontWeight: 700 }}>✅ {success}</div>}
      {error   && <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: 14, marginBottom: 16, color: "#f87171" }}>⚠️ {error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Zone selection */}
        <div style={C.card}>
          <div style={{ fontWeight: 800, marginBottom: 16, fontSize: 16 }}>🎡 Select Play Zone</div>
          {zonesLoading ? (
            <div style={{ color: "#A0A0C0", textAlign: "center", padding: "30px 0" }}>Loading zones…</div>
          ) : zones.length === 0 ? (
            <div style={{ color: "#A0A0C0", textAlign: "center", padding: "30px 0" }}>No zones available right now.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {zones.map(zone => {
                const pct = Math.round((zone.currentOccupancy / zone.capacity) * 100);
                const isSelected = selected.zone === zone.id;
                return (
                  <div key={zone.id} onClick={() => setSelected({ ...selected, zone: zone.id })}
                    style={{ background: isSelected ? "rgba(255,107,53,0.12)" : "#1E1E35", border: `2px solid ${isSelected ? "#FF6B35" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, padding: 14, cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{zone.emoji}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{zone.name}</div>
                    <div style={{ fontSize: 11, color: "#A0A0C0" }}>Age {zone.minAge}–{zone.maxAge} · ${zone.pricePerHour}/hr</div>
                    <div style={{ fontSize: 11, color: pct > 80 ? "#EF4444" : "#A0A0C0", marginTop: 4 }}>{zone.currentOccupancy}/{zone.capacity} ({pct}%)</div>
                    <div style={{ height: 4, background: "#2A2A45", borderRadius: 4, marginTop: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "#EF4444" : "#FF6B35", borderRadius: 4 }} />
                    </div>
                    {zone.waitTime > 0 && <div style={{ fontSize: 10, color: "#FFB703", marginTop: 4 }}>~{zone.waitTime} min wait</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Booking details */}
        <div>
          <div style={{ ...C.card, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 16, fontSize: 16 }}>🕐 Date & Time</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#A0A0C0", marginBottom: 6, textTransform: "uppercase" }}>Date</label>
              <input type="date" value={selected.date} min={today}
                onChange={e => setSelected({ ...selected, date: e.target.value })}
                style={{ width: "100%", padding: 12, background: "#1E1E35", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#F0F0FF", fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#A0A0C0", marginBottom: 6, textTransform: "uppercase" }}>Time Slot</label>
              <select value={selected.time} onChange={e => setSelected({ ...selected, time: e.target.value })}
                style={{ width: "100%", padding: 12, background: "#1E1E35", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#F0F0FF", fontSize: 14, boxSizing: "border-box" }}>
                {TIME_SLOTS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            {children.length > 0 && (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#A0A0C0", marginBottom: 6, textTransform: "uppercase" }}>For Child</label>
                <select value={selected.childId} onChange={e => setSelected({ ...selected, childId: e.target.value })}
                  style={{ width: "100%", padding: 12, background: "#1E1E35", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#F0F0FF", fontSize: 14, boxSizing: "border-box" }}>
                  <option value="">No child selected (adult visit)</option>
                  {children.map(c => <option key={c.id} value={c.id}>{c.name} (Age {c.age})</option>)}
                </select>
              </div>
            )}
          </div>

          <div style={C.card}>
            <div style={{ fontWeight: 800, marginBottom: 14, fontSize: 16 }}>💳 Payment Summary</div>
            <div style={{ background: "#1E1E35", borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#A0A0C0" }}>Zone</span>
                <span>{selectedZone ? `${selectedZone.emoji} ${selectedZone.name}` : "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#A0A0C0" }}>Session (1 hr)</span>
                <span>${selectedZone?.pricePerHour || 0}</span>
              </div>
              {loyaltyDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#A0A0C0" }}>🎁 Loyalty discount</span>
                  <span style={{ color: "#06D6A0" }}>– $5</span>
                </div>
              )}
              {loyaltyPoints > 0 && loyaltyPoints < 100 && (
                <div style={{ fontSize: 11, color: "#FFB703", marginBottom: 8, textAlign: "right" }}>
                  {100 - loyaltyPoints} more pts for $5 off
                </div>
              )}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16 }}>
                <span>Total</span>
                <span style={{ color: "#06D6A0" }}>${total}</span>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#A0A0C0", marginBottom: 6, textTransform: "uppercase" }}>Payment Method</label>
              <select value={selected.payment} onChange={e => setSelected({ ...selected, payment: e.target.value })}
                style={{ width: "100%", padding: 12, background: "#1E1E35", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#F0F0FF", fontSize: 14, boxSizing: "border-box" }}>
                <option value="card">💳 Credit / Debit Card</option>
                <option value="apple_pay">🍎 Apple Pay</option>
                <option value="stripe">💚 Stripe</option>
              </select>
            </div>
            <button onClick={handleBook} disabled={loading || !selected.zone || !selected.date}
              style={{ width: "100%", padding: 13, background: (loading || !selected.zone || !selected.date) ? "#2A2A45" : "linear-gradient(135deg,#FF6B35,#e55a24)", border: "none", borderRadius: 10, color: (loading || !selected.zone || !selected.date) ? "#6B6B8A" : "#fff", fontSize: 15, fontWeight: 700, cursor: (loading || !selected.zone || !selected.date) ? "default" : "pointer", fontFamily: "'Nunito',sans-serif" }}>
              {loading ? "Processing…" : "Confirm & Pay →"}
            </button>
            <div style={{ fontSize: 12, color: "#6B6B8A", textAlign: "center", marginTop: 10 }}>
              +10 loyalty points earned after booking
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
