// src/pages/vendor/VendorDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getVendors, getOrders } from "../../services/firebase";

export default function VendorDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVendors().then(vs => {
      // Match vendor to user by vendorId in profile, or fall back to first vendor for demo
      const matched = userProfile?.vendorId
        ? vs.find(v => v.id === userProfile.vendorId)
        : vs[0];
      if (matched) {
        setVendor(matched);
        return getOrders(matched.id);
      }
      return [];
    }).then(o => { setOrders(o); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userProfile]);

  if (loading) return <div style={{ textAlign: "center", padding: "60px 0", color: "#A0A0C0" }}>Loading dashboard…</div>;

  if (!vendor) return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "#A0A0C0" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
      <p>No vendor account linked. Contact an admin to set up your vendor profile.</p>
    </div>
  );

  const todaySales = orders.reduce((s, o) => s + (o.total || 0), 0);
  const preparing  = orders.filter(o => o.status === "preparing").length;

  const Stat = ({ icon, val, label, color }) => (
    <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 26, marginBottom: 2 }}>{val}</div>
      <div style={{ fontSize: 13, color: "#A0A0C0" }}>{label}</div>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
        {vendor.emoji} {vendor.name}
      </h2>
      <p style={{ color: "#A0A0C0", marginBottom: 24, fontSize: 14 }}>📍 {vendor.location} · ⭐ {vendor.rating} · {vendor.isOpen ? "🟢 Open" : "🔴 Closed"}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
        <Stat icon="💰" val={`$${todaySales.toFixed(0)}`} label="Total Sales"     color="#06D6A0" />
        <Stat icon="📦" val={orders.length}               label="Total Orders"    color="#FF6B35" />
        <Stat icon="⏳" val={preparing}                   label="Preparing Now"   color="#FFB703" />
        <Stat icon="⭐" val={vendor.rating || "—"}        label="Rating"          color="#a78bfa" />
      </div>

      <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>📦 Recent Orders</div>
        {orders.length === 0 ? (
          <div style={{ color: "#A0A0C0", textAlign: "center", padding: "30px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
            No orders yet.
          </div>
        ) : (
          orders.slice(0, 8).map(o => (
            <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{(o.items || []).map(i => i.name).join(", ") || "Order"}</div>
                <div style={{ fontSize: 12, color: "#A0A0C0" }}>Order #{o.id.slice(0, 8).toUpperCase()}</div>
              </div>
              <div style={{ fontWeight: 700, color: "#06D6A0" }}>${o.total?.toFixed(2)}</div>
              <span style={{ background: o.status === "preparing" ? "rgba(255,183,3,0.15)" : o.status === "ready" ? "rgba(6,214,160,0.15)" : "rgba(96,165,250,0.15)", color: o.status === "preparing" ? "#FFB703" : o.status === "ready" ? "#06D6A0" : "#60a5fa", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>
                {o.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
