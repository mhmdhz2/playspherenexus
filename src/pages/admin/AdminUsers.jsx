// src/pages/admin/AdminUsers.jsx
import React, { useState, useEffect } from "react";
import { getAllUsers, updateUserRole } from "../../services/firebase";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    getAllUsers().then(u => { setUsers(u); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setMsg(`Role updated to ${newRole}`);
      load();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = { visitor: "#FF6B35", admin: "#EF4444", staff: "#06D6A0", vendor: "#FFB703" };

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Manage Users 👥</h2>
      {msg && <div style={{ background: "rgba(6,214,160,0.12)", border: "1px solid rgba(6,214,160,0.3)", borderRadius: 10, padding: 12, marginBottom: 16, color: "#06D6A0", fontWeight: 600 }}>✅ {msg}</div>}

      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          style={{ width: "100%", padding: "10px 14px", background: "#1E1E35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#F0F0FF", fontSize: 14, boxSizing: "border-box", fontFamily: "'Nunito',sans-serif", outline: "none" }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#A0A0C0" }}>Loading users…</div>
      ) : (
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Name", "Email", "Role", "Membership", "Points", "Change Role"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#A0A0C0", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: "12px 16px", color: "#A0A0C0" }}>{u.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: (roleColor[u.role] || "#A0A0C0") + "22", color: roleColor[u.role] || "#A0A0C0", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#A0A0C0" }}>{u.membershipPlan || "basic"}</td>
                  <td style={{ padding: "12px 16px", color: "#FFB703", fontWeight: 700 }}>{u.loyaltyPoints || 0}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <select defaultValue={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                      style={{ padding: "5px 8px", background: "#1E1E35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F0F0FF", fontSize: 12 }}>
                      {["visitor", "admin", "staff", "vendor"].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
