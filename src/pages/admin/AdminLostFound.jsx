// src/pages/admin/AdminLostFound.jsx
import React, { useState, useEffect } from "react";
import { getLostItems, updateLostItemStatus } from "../../services/firebase";

export default function AdminLostFound() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => {
    setLoading(true);
    getLostItems().then(i => { setItems(i); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    await updateLostItemStatus(id, status);
    load();
  };

  const filtered = filter === "all" ? items : items.filter(i => i.status === filter);

  const STATUS = {
    searching: { bg: "rgba(255,183,3,0.15)", color: "#FFB703" },
    found:     { bg: "rgba(6,214,160,0.15)", color: "#06D6A0" },
    returned:  { bg: "rgba(96,165,250,0.15)", color: "#60a5fa" },
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Lost & Found 🔍</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "searching", "found", "returned"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${filter === s ? "#FF6B35" : "rgba(255,255,255,0.08)"}`, background: filter === s ? "rgba(255,107,53,0.12)" : "#1E1E35", color: filter === s ? "#FF6B35" : "#A0A0C0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#A0A0C0" }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#A0A0C0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p>No lost items reported.</p>
        </div>
      ) : (
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Reporter", "Item", "Location", "Date Lost", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#A0A0C0", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const sc = STATUS[item.status] || STATUS.searching;
                return (
                  <tr key={item.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>{item.userName || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>{item.itemType}</td>
                    <td style={{ padding: "12px 16px", color: "#A0A0C0" }}>{item.location}</td>
                    <td style={{ padding: "12px 16px", color: "#A0A0C0" }}>{item.dateLost}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>{item.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {item.status === "searching" && (
                          <button onClick={() => handleStatus(item.id, "found")}
                            style={{ padding: "5px 10px", background: "rgba(6,214,160,0.12)", border: "1px solid rgba(6,214,160,0.3)", borderRadius: 8, color: "#06D6A0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            Found
                          </button>
                        )}
                        {item.status === "found" && (
                          <button onClick={() => handleStatus(item.id, "returned")}
                            style={{ padding: "5px 10px", background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)", borderRadius: 8, color: "#60a5fa", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            Returned
                          </button>
                        )}
                      </div>
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
