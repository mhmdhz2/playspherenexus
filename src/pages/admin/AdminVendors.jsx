// src/pages/admin/AdminVendors.jsx
import React, { useState, useEffect } from "react";
import { getVendors, getMenuItems } from "../../services/firebase";

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [menus, setMenus] = useState({});

  useEffect(() => {
    getVendors().then(v => { setVendors(v); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggleVendor = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!menus[id]) {
      const items = await getMenuItems(id);
      setMenus(m => ({ ...m, [id]: items }));
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Manage Vendors 🏪</h2>
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#A0A0C0" }}>Loading vendors…</div>
      ) : vendors.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#A0A0C0" }}>No vendors found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {vendors.map(v => (
            <div key={v.id} style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 }}>
              <div onClick={() => toggleVendor(v.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 20, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{v.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{v.name}</div>
                    <div style={{ fontSize: 13, color: "#A0A0C0" }}>📍 {v.location} · ⭐ {v.rating}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ background: v.isOpen ? "rgba(6,214,160,0.15)" : "rgba(239,68,68,0.15)", color: v.isOpen ? "#06D6A0" : "#EF4444", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
                    {v.isOpen ? "● Open" : "● Closed"}
                  </span>
                  <span style={{ color: "#A0A0C0", fontSize: 18 }}>{expanded === v.id ? "▾" : "▸"}</span>
                </div>
              </div>
              {expanded === v.id && (
                <div style={{ padding: "0 20px 20px" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "#A0A0C0" }}>Menu Items</div>
                  {!menus[v.id] ? (
                    <div style={{ color: "#A0A0C0" }}>Loading menu…</div>
                  ) : menus[v.id].length === 0 ? (
                    <div style={{ color: "#A0A0C0" }}>No menu items.</div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                      {menus[v.id].map(item => (
                        <div key={item.id} style={{ background: "#1E1E35", borderRadius: 10, padding: 12 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: "#A0A0C0" }}>{item.category}</div>
                          <div style={{ fontWeight: 800, color: "#06D6A0", marginTop: 4 }}>${item.price}</div>
                          {item.containsAlcohol && <div style={{ fontSize: 10, color: "#FFB703" }}>🔞 21+</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
