// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, loginWithGoogle, getUserProfile } from "../services/firebase";

const S = {
  wrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,107,53,0.15) 0%, transparent 50%), #0F0F1A", padding: 24, fontFamily: "'Nunito',sans-serif" },
  card: { background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 420, color: "#F0F0FF" },
  logo: { display: "flex", alignItems: "center", gap: 12, marginBottom: 28, justifyContent: "center" },
  logoIcon: { width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#FF6B35,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 },
  h2: { fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 26, textAlign: "center", marginBottom: 6 },
  sub: { color: "#A0A0C0", fontSize: 14, textAlign: "center", marginBottom: 24 },
  label: { display: "block", fontSize: 12, fontWeight: 800, color: "#A0A0C0", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { width: "100%", padding: "13px 14px", background: "#1E1E35", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#F0F0FF", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "'Nunito',sans-serif" },
  btnPrimary: { width: "100%", padding: "13px", background: "linear-gradient(135deg,#FF6B35,#e55a24)", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" },
  btnGoogle: { width: "100%", padding: "11px", background: "#1E1E35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#F0F0FF", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10, fontFamily: "'Nunito',sans-serif" },
  error: { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#f87171", marginBottom: 16 },
  demoBox: { marginTop: 20, padding: 14, background: "#1E1E35", borderRadius: 10, fontSize: 12, color: "#A0A0C0" },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getRoleRoute = async (user) => {
    const profile = await getUserProfile(user.uid);
    const routes = { admin: "/admin", staff: "/staff", vendor: "/vendor", visitor: "/visitor" };
    return routes[profile?.role] || "/visitor";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const cred = await loginUser(email, password);
      navigate(await getRoleRoute(cred.user));
    } catch (err) {
      setError(err.code === "auth/invalid-credential" ? "Invalid email or password." : err.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try {
      const cred = await loginWithGoogle();
      navigate(await getRoleRoute(cred.user));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const demoLogin = (demoEmail, demoPass) => { setEmail(demoEmail); setPassword(demoPass); };

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.logoIcon}>🎠</div>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 22 }}>
            Play<span style={{ color: "#FF6B35" }}>Sphere</span> Nexus
          </div>
        </div>
        <h2 style={S.h2}>Welcome back! 👋</h2>
        <p style={S.sub}>Sign in to your account</p>

        {error && <div style={S.error}>⚠️ {error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Email</label>
            <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button style={S.btnPrimary} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <button style={S.btnGoogle} onClick={handleGoogle} disabled={loading}>
          🌐 Continue with Google
        </button>

        <p style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "#A0A0C0" }}>
          Don't have an account? <Link to="/register" style={{ color: "#FF6B35", fontWeight: 700 }}>Register</Link>
        </p>

        <div style={S.demoBox}>
          <strong style={{ color: "#F0F0FF" }}>Demo accounts (set up in Firebase):</strong>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              ["visitor@playsphere.com", "demo123456", "👤 Visitor"],
              ["admin@playsphere.com",   "demo123456", "⚙️ Admin"],
              ["staff@playsphere.com",   "demo123456", "🎯 Staff"],
              ["vendor@playsphere.com",  "demo123456", "🏪 Vendor"],
            ].map(([e, p, label]) => (
              <button key={e} onClick={() => demoLogin(e, p)}
                style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#A0A0C0", borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer", textAlign: "left" }}>
                {label}: {e}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
