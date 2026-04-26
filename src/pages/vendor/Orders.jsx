// src/pages/vendor/Orders.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getOrders, updateOrderStatus, getVendors } from "../../services/firebase";

export default function Orders() {
  const { currentUser, userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        // Find vendor by email/uid
        const vendors = await getVendors();
        // In a real app, vendor profiles would have a userId. For now use first vendor or match by name.
        const myVendor = vendors[0]; // default to first vendor for demo
        if (myVendor) {
          setVendorId(myVendor.id);
          const o = await getOrders(myVendor.id);
          setOrders(o);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [currentUser]);

  const handleStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const STATUS_COLORS = {
    preparing: { bg: "rgba(255,183,3,0.15)", color: "#FFB703" },
    ready:     { bg: "rgba(6,214,160,0.15)", color: "#06D6A0" },
    delivered: { bg: "rgba(96,165,250,0.15)", color: "#60a5fa" },
    cancelled: { bg: "rgba(239,68,68,0.15)", color: "#EF4444" },
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Incoming Orders 📦</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "preparing", "ready", "delivered"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${filter === s ? "#FF6B35" : "rgba(255,255,255,0.08)"}`, background: filter === s ? "rgba(255,107,53,0.12)" : "#1E1E35", color: filter === s ? "#FF6B35" : "#A0A0C0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#A0A0C0" }}>Loading orders…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#A0A0C0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p>No orders yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(order => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.preparing;
            return (
              <div key={order.id} style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>Order #{order.id.slice(0, 8).toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: "#A0A0C0", marginTop: 2 }}>
                      {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString() : "Just now"}
                    </div>
                  </div>
                  <span style={{ background: sc.bg, color: sc.color, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, height: "fit-content" }}>
                    {order.status}
                  </span>
                </div>

                <div style={{ background: "#1E1E35", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                  {(order.items || []).map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: i < order.items.length - 1 ? 6 : 0 }}>
                      <span style={{ fontSize: 13 }}>{item.name}</span>
                      <span style={{ fontSize: 13, color: "#06D6A0", fontWeight: 700 }}>${item.price}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
                    <span>Total</span>
                    <span style={{ color: "#06D6A0" }}>${order.total?.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {order.status === "preparing" && (
                    <button onClick={() => handleStatus(order.id, "ready")}
                      style={{ flex: 1, padding: "9px 0", background: "linear-gradient(135deg,#06D6A0,#059669)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      ✓ Mark Ready
                    </button>
                  )}
                  {order.status === "ready" && (
                    <button onClick={() => handleStatus(order.id, "delivered")}
                      style={{ flex: 1, padding: "9px 0", background: "linear-gradient(135deg,#60a5fa,#3b82f6)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      ✓ Mark Delivered
                    </button>
                  )}
                  {["preparing", "ready"].includes(order.status) && (
                    <button onClick={() => handleStatus(order.id, "cancelled")}
                      style={{ padding: "9px 14px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#EF4444", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
