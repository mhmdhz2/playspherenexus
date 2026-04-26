// src/pages/visitor/Support.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { submitSupportTicket, submitLostItem, getSupportTickets, getLostItems } from "../../services/firebase";

export default function Support() {
  const { currentUser, userProfile } = useAuth();
  const [tab, setTab] = useState("it");
  const [tickets, setTickets] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [form, setForm] = useState({ category: "App not loading", description: "", itemType: "", location: "Trampoline Zone A", dateLost: "" });
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    if (currentUser) {
      getSupportTickets(currentUser.uid).then(setTickets).catch(() => {});
      getLostItems().then(items => setLostItems(items.filter(i => i.userId === currentUser.uid))).catch(() => {});
    }
  };

  useEffect(() => { loadData(); }, [currentUser]);

  const handleSubmitIT = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    setSubmitting(true);
    try {
      await submitSupportTicket({ userId: currentUser.uid, userName: userProfile?.name || "User", type: "IT", category: form.category, description: form.description });
      setSuccess("IT ticket submitted! Our team will respond within 24 hours.");
      setForm(f => ({ ...f, description: "" }));
      loadData();
    } catch (err) {
      setSuccess("Error: " + err.message);
    }
    setSubmitting(false);
  };

  const handleSubmitLost = async (e) => {
    e.preventDefault();
    if (!form.itemType.trim() || !form.dateLost) return;
    setSubmitting(true);
    try {
      await submitLostItem({ userId: currentUser.uid, userName: userProfile?.name || "User", itemType: form.itemType, location: form.location, dateLost: form.dateLost });
      setSuccess("Lost item report submitted! We'll search and contact you if found.");
      setForm(f => ({ ...f, itemType: "", dateLost: "" }));
      loadData();
    } catch (err) {
      setSuccess("Error: " + err.message);
    }
    setSubmitting(false);
  };

  const inputSt = { width: "100%", padding: 11, background: "#1E1E35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#F0F0FF", fontSize: 14, boxSizing: "border-box", fontFamily: "'Nunito',sans-serif", outline: "none" };
  const Inp = ({ label, children }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#A0A0C0", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>
      {children}
    </div>
  );

  const allCases = [
    ...tickets.map(t => ({ ...t, kind: "it" })),
    ...lostItems.map(l => ({ ...l, kind: "lost" }))
  ].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Support & Help 🆘</h2>
      <p style={{ color: "#A0A0C0", fontSize: 14, marginBottom: 20 }}>Report IT issues, submit lost item reports, and track your cases</p>

      {success && (
        <div style={{ background: success.startsWith("Error") ? "rgba(239,68,68,0.12)" : "rgba(6,214,160,0.12)", border: `1px solid ${success.startsWith("Error") ? "rgba(239,68,68,0.3)" : "rgba(6,214,160,0.3)"}`, borderRadius: 10, padding: 14, marginBottom: 16, color: success.startsWith("Error") ? "#f87171" : "#06D6A0", fontWeight: 600 }}>
          {success.startsWith("Error") ? "⚠️" : "✅"} {success}
          <button onClick={() => setSuccess("")} style={{ float: "right", background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Submit form */}
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", gap: 4, background: "#1E1E35", borderRadius: 10, padding: 4, marginBottom: 20 }}>
            {[["it", "🔧 IT Issue"], ["lost", "🔍 Lost Item"]].map(([id, lbl]) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: tab === id ? "#22223A" : "transparent", color: tab === id ? "#F0F0FF" : "#A0A0C0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {lbl}
              </button>
            ))}
          </div>

          {tab === "it" ? (
            <form onSubmit={handleSubmitIT}>
              <Inp label="Issue Category">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputSt}>
                  {["App not loading", "Payment error", "Ticket access problem", "Booking issue", "Account issue", "Other"].map(o => <option key={o}>{o}</option>)}
                </select>
              </Inp>
              <Inp label="Description">
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} style={{ ...inputSt, resize: "none" }} placeholder="Describe your issue in detail…" required />
              </Inp>
              <button type="submit" disabled={submitting} style={{ width: "100%", padding: 11, background: submitting ? "#2A2A45" : "linear-gradient(135deg,#FF6B35,#e55a24)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: submitting ? "default" : "pointer" }}>
                {submitting ? "Submitting…" : "Submit IT Ticket →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitLost}>
              <Inp label="Item Description">
                <input value={form.itemType} onChange={e => setForm({ ...form, itemType: e.target.value })} style={inputSt} placeholder="e.g. Blue backpack, Sunglasses, Jacket" required />
              </Inp>
              <Inp label="Last Seen Location">
                <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inputSt}>
                  {["Trampoline Zone A", "Climbing Wall B", "Ball Pit Zone", "Foam Pit Arena", "Interactive Games", "Food Court", "Main Entrance", "Restrooms", "Other"].map(o => <option key={o}>{o}</option>)}
                </select>
              </Inp>
              <Inp label="Date Lost">
                <input type="date" value={form.dateLost} onChange={e => setForm({ ...form, dateLost: e.target.value })} style={inputSt} required />
              </Inp>
              <button type="submit" disabled={submitting} style={{ width: "100%", padding: 11, background: submitting ? "#2A2A45" : "linear-gradient(135deg,#FF6B35,#e55a24)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: submitting ? "default" : "pointer" }}>
                {submitting ? "Submitting…" : "Submit Lost Item Report →"}
              </button>
            </form>
          )}
        </div>

        {/* My cases */}
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>📋 My Cases ({allCases.length})</div>
          {allCases.length === 0 ? (
            <div style={{ color: "#A0A0C0", textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
              <p style={{ fontSize: 14 }}>No cases submitted yet.</p>
            </div>
          ) : (
            <div style={{ maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {allCases.map(item => (
                <div key={item.id} style={{ background: "#1E1E35", borderRadius: 10, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {item.kind === "it" ? "🔧 " + item.category : "🔍 " + item.itemType}
                    </div>
                    <span style={{ background: item.status === "resolved" ? "rgba(6,214,160,0.15)" : "rgba(255,183,3,0.15)", color: item.status === "resolved" ? "#06D6A0" : "#FFB703", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                      {item.status}
                    </span>
                  </div>
                  {item.description && <div style={{ fontSize: 12, color: "#A0A0C0", marginBottom: 4 }}>{item.description.slice(0, 80)}{item.description.length > 80 ? "…" : ""}</div>}
                  {item.location && <div style={{ fontSize: 11, color: "#6B6B8A" }}>📍 {item.location}</div>}
                  <div style={{ fontSize: 11, color: "#6B6B8A", marginTop: 4 }}>Case ID: {item.id.slice(0, 10).toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, marginTop: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>❓ Frequently Asked Questions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            ["How do I check in?", "Show your QR code at the entrance gate or to any staff member."],
            ["Can I reschedule my booking?", "Contact support with your booking ID to reschedule up to 2 hours before the session."],
            ["How do I earn loyalty points?", "You earn 10 points per booking and 1 point per $1 spent on food."],
            ["What is the cancellation policy?", "Free cancellation up to 24 hours before your session. Contact support for assistance."],
          ].map(([q, a]) => (
            <div key={q} style={{ background: "#1E1E35", borderRadius: 10, padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: "#FF6B35" }}>Q: {q}</div>
              <div style={{ fontSize: 12, color: "#A0A0C0", lineHeight: 1.6 }}>{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
