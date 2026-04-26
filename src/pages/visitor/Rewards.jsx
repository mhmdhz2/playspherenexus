// src/pages/visitor/Rewards.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getPointsHistory, redeemPoints } from "../../services/firebase";

const REWARDS = [
  { id: "discount5",  icon: "💳", title: "$5 Discount",        desc: "On your next booking",  cost: 100 },
  { id: "vip_pass",   icon: "🎟️", title: "VIP Fast Pass",     desc: "Skip the queue once",   cost: 200 },
  { id: "meal",       icon: "🍔", title: "Free Meal Voucher",  desc: "Any item up to $12",    cost: 300 },
  { id: "birthday",   icon: "🎂", title: "Birthday Party Pkg", desc: "20% off event booking", cost: 500 },
];

export default function Rewards() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (currentUser) {
      getPointsHistory(currentUser.uid)
        .then(h => { setHistory(h); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleRedeem = async () => {
    if (!selected) { setMsg({ type: "error", text: "Please select a reward." }); return; }
    const reward = REWARDS.find(r => r.id === selected);
    if ((userProfile?.loyaltyPoints || 0) < reward.cost) {
      setMsg({ type: "error", text: `Not enough points. You need ${reward.cost} pts.` }); return;
    }
    setRedeeming(true);
    try {
      await redeemPoints(currentUser.uid, reward.cost, reward.title);
      if (refreshProfile) await refreshProfile();
      setMsg({ type: "success", text: `✅ "${reward.title}" redeemed! Check your rewards in your profile.` });
      setSelected(null);
      getPointsHistory(currentUser.uid).then(setHistory);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
    setRedeeming(false);
  };

  const pts = userProfile?.loyaltyPoints || 0;
  const ringPct = Math.min(pts / 500, 1);
  const circumference = 2 * Math.PI * 42;

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Loyalty & Rewards ⭐</h2>
      {msg.text && (
        <div style={{ background: msg.type === "success" ? "rgba(6,214,160,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${msg.type === "success" ? "rgba(6,214,160,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 10, padding: 14, marginBottom: 16, color: msg.type === "success" ? "#06D6A0" : "#f87171", fontWeight: 600 }}>
          {msg.text}
          <button onClick={() => setMsg({ type: "", text: "" })} style={{ float: "right", background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Points balance */}
        <div>
          <div style={{ background: "linear-gradient(135deg,rgba(255,183,3,0.05),#22223A)", border: "1px solid rgba(255,183,3,0.2)", borderRadius: 16, padding: 24, textAlign: "center", marginBottom: 16 }}>
            <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 16px" }}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,183,3,0.15)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#FFB703" strokeWidth="8"
                  strokeDasharray={`${ringPct * circumference} ${circumference}`} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Poppins',sans-serif", fontSize: 20, fontWeight: 800, color: "#FFB703" }}>{pts}</div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{pts} Points</div>
            <div style={{ fontSize: 13, color: "#A0A0C0" }}>{500 - Math.min(pts, 500)} pts to next tier</div>
          </div>

          {/* How to earn */}
          <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>💡 How to Earn Points</div>
            {[
              ["📅", "Book a session", "+10 pts"],
              ["🍔", "Buy food ($1)", "+1 pt"],
              ["🎉", "Refer a friend", "+50 pts"],
              ["⭐", "Write a review", "+20 pts"],
            ].map(([icon, action, pts]) => (
              <div key={action} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "#A0A0C0" }}>{icon} {action}</span>
                <span style={{ color: "#FFB703", fontWeight: 700 }}>{pts}</span>
              </div>
            ))}
          </div>

          {/* Redeem button */}
          <button onClick={handleRedeem} disabled={redeeming || !selected}
            style={{ width: "100%", padding: 12, background: selected && !redeeming ? "linear-gradient(135deg,#FFB703,#d97706)" : "#2A2A45", border: "none", borderRadius: 12, color: selected ? "#000" : "#6B6B8A", fontSize: 14, fontWeight: 800, cursor: selected ? "pointer" : "default" }}>
            {redeeming ? "Redeeming…" : selected ? `Redeem ${REWARDS.find(r => r.id === selected)?.title}` : "Select a reward above"}
          </button>
        </div>

        {/* Rewards catalogue */}
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>🎁 Available Rewards</div>
          {REWARDS.map(r => {
            const canAfford = pts >= r.cost;
            const isSelected = selected === r.id;
            return (
              <div key={r.id} onClick={() => canAfford && setSelected(isSelected ? null : r.id)}
                style={{ background: isSelected ? "rgba(255,183,3,0.08)" : "#22223A", border: `1px solid ${isSelected ? "rgba(255,183,3,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: 16, marginBottom: 12, cursor: canAfford ? "pointer" : "default", opacity: canAfford ? 1 : 0.5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 28 }}>{r.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: "#A0A0C0" }}>{r.desc}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: canAfford ? "#FFB703" : "#6B6B8A", fontSize: 14 }}>{r.cost} pts</div>
                    {!canAfford && <div style={{ fontSize: 10, color: "#6B6B8A" }}>Need {r.cost - pts} more</div>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* History */}
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, marginTop: 20 }}>📊 Points History</div>
          {loading ? (
            <div style={{ color: "#A0A0C0", textAlign: "center", padding: "16px 0" }}>Loading…</div>
          ) : history.length === 0 ? (
            <div style={{ color: "#A0A0C0", textAlign: "center", padding: "16px 0", fontSize: 13 }}>No transactions yet.</div>
          ) : (
            <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {history.slice(0, 10).map(h => (
                <div key={h.id} style={{ background: "#22223A", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 13, color: "#A0A0C0" }}>{h.reason}</div>
                  <div style={{ fontWeight: 700, color: h.points > 0 ? "#06D6A0" : "#EF4444" }}>
                    {h.points > 0 ? "+" : ""}{h.points} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
