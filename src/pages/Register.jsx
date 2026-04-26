// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/firebase";

const S = {
  wrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 80% 50%, rgba(255,107,53,0.15) 0%, transparent 60%), #0F0F1A", padding: 24, fontFamily: "'Nunito',sans-serif" },
  card: { background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 440, color: "#F0F0FF" },
  input: { width: "100%", padding: "13px 14px", background: "#1E1E35", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#F0F0FF", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "'Nunito',sans-serif" },
  label: { display: "block", fontSize: 12, fontWeight: 800, color: "#A0A0C0", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" },
  error: { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#f87171", marginBottom: 16 },
};

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "visitor", accountType: "personal" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await registerUser(form.email, form.password, form.name, form.role, form.accountType);
      navigate(`/${form.role}`);
    } catch (err) {
      setError(err.code === "auth/email-already-in-use" ? "Email already registered." : err.message);
    }
    setLoading(false);
  };

  const field = (label, name, type = "text", placeholder = "") => (
    <div style={{ marginBottom: 16 }}>
      <label style={S.label}>{label}</label>
      <input style={S.input} name={name} type={type} value={form[name]} onChange={handleChange} placeholder={placeholder} required />
    </div>
  );

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#FF6B35,#7C3AED)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>🎠</div>
          <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 24, margin: "0 0 6px" }}>Create Account 🎉</h2>
          <p style={{ color: "#A0A0C0", fontSize: 14 }}>Join PlaySphere Nexus today</p>
        </div>

        {error && <div style={S.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {field("Full Name", "name", "text", "Your full name")}
          {field("Email Address", "email", "email", "you@example.com")}
          {field("Password", "password", "password", "Min. 6 characters")}
          {field("Confirm Password", "confirm", "password", "Repeat password")}

          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Account Type</label>
            <select name="accountType" value={form.accountType} onChange={handleChange}
              style={{ ...S.input, cursor: "pointer" }}>
              <option value="personal">👤 Personal Account</option>
              <option value="family">👨‍👩‍👧‍👦 Family Account</option>
            </select>
          </div>

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: 13, background: "linear-gradient(135deg,#FF6B35,#e55a24)", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "#A0A0C0" }}>
          Already have an account? <Link to="/login" style={{ color: "#FF6B35", fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
