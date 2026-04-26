// src/pages/visitor/Children.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getChildProfiles, addChildProfile, deleteChildProfile } from "../../services/firebase";

export default function Children() {
  const { currentUser } = useAuth();
  const [children, setChildren] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", height: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = () => {
    if (currentUser) getChildProfiles(currentUser.uid).then(setChildren);
  };
  useEffect(() => { load(); }, [currentUser]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await addChildProfile(currentUser.uid, {
        name: form.name.trim(),
        age: parseInt(form.age),
        height: parseInt(form.height),
        notes: form.notes.trim()
      });
      setMsg({ type: "success", text: `${form.name}'s profile added!` });
      setForm({ name: "", age: "", height: "", notes: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
    setLoading(false);
  };

  const handleDelete = async (childId, childName) => {
    if (!window.confirm(`Remove ${childName}'s profile?`)) return;
    try {
      await deleteChildProfile(currentUser.uid, childId);
      setMsg({ type: "success", text: `${childName}'s profile removed.` });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  };

  const emojis = ["👧", "👦", "🧒", "👶", "🧑"];
  const inp = { width: "100%", padding: 12, background: "#1E1E35", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#F0F0FF", fontSize: 14, boxSizing: "border-box", fontFamily: "'Nunito',sans-serif", outline: "none" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800 }}>Child Profiles 👧👦</h2>
          <p style={{ color: "#A0A0C0", fontSize: 14, marginTop: 4 }}>Manage your children's playground profiles</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setMsg({ type: "", text: "" }); }}
          style={{ padding: "10px 18px", background: "linear-gradient(135deg,#FF6B35,#e55a24)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          {showForm ? "✕ Cancel" : "+ Add Child"}
        </button>
      </div>

      {msg.text && (
        <div style={{ background: msg.type === "success" ? "rgba(6,214,160,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${msg.type === "success" ? "rgba(6,214,160,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 10, padding: 14, marginBottom: 16, color: msg.type === "success" ? "#06D6A0" : "#f87171", fontWeight: 600 }}>
          {msg.type === "success" ? "✅" : "⚠️"} {msg.text}
          <button onClick={() => setMsg({ type: "", text: "" })} style={{ float: "right", background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {showForm && (
        <div style={{ background: "#22223A", border: "1px solid rgba(255,107,53,0.3)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Add New Child Profile</div>
          <form onSubmit={handleAdd}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {[["name", "Child's Full Name", "text", "e.g. Sarah"], ["age", "Age (years)", "number", "e.g. 7"], ["height", "Height (cm)", "number", "e.g. 120"], ["notes", "Safety Notes (optional)", "text", "e.g. peanut allergy"]].map(([key, lbl, type, ph]) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#A0A0C0", marginBottom: 6, textTransform: "uppercase" }}>{lbl}</label>
                  <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    style={inp} placeholder={ph} required={key !== "notes"}
                    min={type === "number" ? 1 : undefined} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={loading}
                style={{ padding: "10px 20px", background: loading ? "#2A2A45" : "linear-gradient(135deg,#FF6B35,#e55a24)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer" }}>
                {loading ? "Saving…" : "Save Profile"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ padding: "10px 20px", background: "#1E1E35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#A0A0C0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {children.length === 0 ? (
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "60px 40px", textAlign: "center", color: "#A0A0C0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👶</div>
          <p>No child profiles yet. Add your first child to start booking!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {children.map((child, i) => (
            <div key={child.id} style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#FF6B35,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 12px" }}>
                {emojis[i % emojis.length]}
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{child.name}</div>
              <div style={{ fontSize: 13, color: "#A0A0C0" }}>Age: {child.age} years</div>
              <div style={{ fontSize: 13, color: "#A0A0C0" }}>Height: {child.height} cm</div>
              {child.notes && <div style={{ fontSize: 12, color: "#6B6B8A", marginTop: 6, fontStyle: "italic" }}>{child.notes}</div>}
              <div style={{ marginTop: 10, marginBottom: 14 }}>
                <span style={{ background: child.rfidActive ? "rgba(6,214,160,0.15)" : "rgba(255,255,255,0.05)", color: child.rfidActive ? "#06D6A0" : "#6B6B8A", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                  {child.rfidActive ? "✓ RFID Active" : "No RFID"}
                </span>
              </div>
              <button onClick={() => handleDelete(child.id, child.name)}
                style={{ width: "100%", padding: "8px 0", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, color: "#EF4444", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                🗑 Remove Profile
              </button>
            </div>
          ))}
          <div onClick={() => setShowForm(true)}
            style={{ background: "transparent", border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 16, padding: 24, textAlign: "center", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>➕</div>
            <div style={{ color: "#A0A0C0", fontWeight: 700 }}>Add Child</div>
          </div>
        </div>
      )}
    </div>
  );
}
