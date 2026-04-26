// src/pages/visitor/Food.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getVendors, getMenuItems, createOrder } from "../../services/firebase";

export default function Food() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [activeVendor, setActiveVendor] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    getVendors()
      .then(v => { setVendors(v); if (v.length) setActiveVendor(v[0]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeVendor) return;
    setMenuLoading(true);
    setMenu([]);
    getMenuItems(activeVendor.id)
      .then(setMenu)
      .catch(() => {})
      .finally(() => setMenuLoading(false));
  }, [activeVendor]);

  const addToCart = (item) => setCart(c => [...c, item]);
  const removeFromCart = (idx) => setCart(c => c.filter((_, i) => i !== idx));
  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  const pts = userProfile?.loyaltyPoints || 0;
  const discount = pts >= 100 ? 5 : 0;
  const total = Math.max(0, subtotal - discount);

  const placeOrder = async () => {
    if (!cart.length) { setMsg({ type: "error", text: "Please add items to your cart first." }); return; }
    if (!currentUser) { setMsg({ type: "error", text: "Please log in to place an order." }); return; }
    setOrdering(true);
    try {
      await createOrder({
        userId: currentUser.uid,
        vendorId: activeVendor.id,
        vendorName: activeVendor.name,
        items: cart.map(i => ({ name: i.name, price: i.price })),
        subtotal, discount, total,
        paymentMethod: "card",
      });
      setCart([]);
      if (refreshProfile) await refreshProfile();
      setMsg({ type: "success", text: `🍔 Order placed! Estimated wait: 8–12 min. +${Math.floor(total)} loyalty pts earned!` });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
    setOrdering(false);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Food & Drinks 🍔</h2>
      <p style={{ color: "#A0A0C0", fontSize: 14, marginBottom: 20 }}>Order from our in-park vendors and earn loyalty points</p>

      {msg.text && (
        <div style={{ background: msg.type === "success" ? "rgba(6,214,160,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${msg.type === "success" ? "rgba(6,214,160,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 10, padding: 14, marginBottom: 16, color: msg.type === "success" ? "#06D6A0" : "#f87171", fontWeight: 600 }}>
          {msg.text}
          <button onClick={() => setMsg({ type: "", text: "" })} style={{ float: "right", background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#A0A0C0" }}>Loading vendors…</div>
      ) : vendors.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#A0A0C0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
          <p>No vendors available yet. Please check back soon!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Menu side */}
          <div>
            {/* Vendor tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {vendors.map(v => (
                <button key={v.id} onClick={() => setActiveVendor(v)}
                  style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${activeVendor?.id === v.id ? "#FF6B35" : "rgba(255,255,255,0.08)"}`, background: activeVendor?.id === v.id ? "rgba(255,107,53,0.12)" : "#1E1E35", color: activeVendor?.id === v.id ? "#FF6B35" : "#A0A0C0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {v.emoji} {v.name}
                  {v.isOpen ? <span style={{ marginLeft: 6, fontSize: 10, color: "#06D6A0" }}>● Open</span> : <span style={{ marginLeft: 6, fontSize: 10, color: "#EF4444" }}>● Closed</span>}
                </button>
              ))}
            </div>

            {/* Vendor info */}
            {activeVendor && (
              <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 12, marginBottom: 12, display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 28 }}>{activeVendor.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{activeVendor.name}</div>
                  <div style={{ fontSize: 12, color: "#A0A0C0" }}>📍 {activeVendor.location} · ⭐ {activeVendor.rating}</div>
                </div>
              </div>
            )}

            {/* Menu items */}
            <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>{activeVendor?.emoji} Menu</div>
              {menuLoading ? (
                <div style={{ color: "#A0A0C0", textAlign: "center", padding: "20px 0" }}>Loading menu…</div>
              ) : menu.filter(i => i.available).length === 0 ? (
                <div style={{ color: "#A0A0C0", textAlign: "center", padding: "20px 0" }}>No items available.</div>
              ) : (
                ["Main", "Side", "Drink", "Food"].map(cat => {
                  const items = menu.filter(i => i.available && i.category === cat);
                  if (!items.length) return null;
                  return (
                    <div key={cat} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#A0A0C0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{cat}</div>
                      {items.map(item => (
                        <div key={item.id} style={{ background: "#1E1E35", borderRadius: 10, padding: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                            {item.containsAlcohol && <div style={{ fontSize: 11, color: "#FFB703" }}>🔞 21+ only</div>}
                          </div>
                          <div style={{ fontWeight: 800, color: "#06D6A0", marginRight: 8 }}>${item.price}</div>
                          <button onClick={() => addToCart(item)}
                            style={{ padding: "6px 14px", background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.3)", borderRadius: 8, color: "#FF6B35", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Cart */}
          <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>🛒 Your Cart ({cart.length})</div>
            {cart.length === 0 ? (
              <div style={{ color: "#A0A0C0", textAlign: "center", padding: "30px 0", fontSize: 14 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🛒</div>
                Cart is empty. Add items from the menu!
              </div>
            ) : (
              <>
                {cart.map((item, i) => (
                  <div key={i} style={{ background: "#1E1E35", borderRadius: 10, padding: 12, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#A0A0C0" }}>{activeVendor?.name}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: "#06D6A0" }}>${item.price}</div>
                    <button onClick={() => removeFromCart(i)}
                      style={{ padding: "4px 10px", background: "rgba(239,68,68,0.12)", border: "none", borderRadius: 6, color: "#EF4444", cursor: "pointer", fontSize: 12 }}>✕</button>
                  </div>
                ))}

                <div style={{ background: "#1E1E35", borderRadius: 10, padding: 14, margin: "14px 0", fontSize: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "#A0A0C0" }}>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: "#A0A0C0" }}>Loyalty discount (100 pts)</span>
                      <span style={{ color: "#06D6A0" }}>–${discount}</span>
                    </div>
                  )}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "8px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16 }}>
                    <span>Total</span><span style={{ color: "#06D6A0" }}>${total.toFixed(2)}</span>
                  </div>
                </div>

                {pts > 0 && pts < 100 && (
                  <div style={{ fontSize: 12, color: "#FFB703", marginBottom: 10, textAlign: "center" }}>
                    ⭐ {100 - pts} more pts for a $5 discount
                  </div>
                )}

                <button onClick={placeOrder} disabled={ordering}
                  style={{ width: "100%", padding: 12, background: ordering ? "#2A2A45" : "linear-gradient(135deg,#FF6B35,#e55a24)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: ordering ? "default" : "pointer" }}>
                  {ordering ? "Placing order…" : "Place Order 🛒"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
