// src/pages/visitor/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getUserBookings, getZones } from "../../services/firebase";

export default function VisitorDashboard() {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [b, z] = await Promise.all([
          currentUser ? getUserBookings(currentUser.uid) : Promise.resolve([]),
          getZones()
        ]);
        setBookings(b);
        setZones(z);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
      setLoading(false);
    };
    load();
  }, [currentUser]);

  const upcoming = bookings.filter(b => b.status === "confirmed" && !b.checkedIn);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const Stat = ({ icon, value, label, color }) => (
    <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 26, marginBottom: 2 }}>{loading ? "…" : value}</div>
      <div style={{ fontSize: 13, color: "#A0A0C0" }}>{label}</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 24 }}>
          {greeting}, {userProfile?.name?.split(" ")[0] || "there"}! 👋
        </h2>
        <p style={{ color: "#A0A0C0", marginTop: 4 }}>Here's your PlaySphere Nexus overview</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
        <Stat icon="📅" value={upcoming.length} label="Upcoming Bookings" color="#FF6B35" />
        <Stat icon="⭐" value={userProfile?.loyaltyPoints || 0} label="Loyalty Points" color="#FFB703" />
        <Stat icon="🎡" value={zones.filter(z => z.status === "active").length} label="Zones Open" color="#06D6A0" />
        <Stat icon="📋" value={bookings.length} label="Total Bookings" color="#a78bfa" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Upcoming sessions */}
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>📅 Upcoming Sessions</div>
          {loading ? (
            <div style={{ color: "#A0A0C0", fontSize: 14, textAlign: "center", padding: "20px 0" }}>Loading…</div>
          ) : upcoming.length === 0 ? (
            <div style={{ color: "#A0A0C0", fontSize: 14, textAlign: "center", padding: "20px 0" }}>No upcoming sessions.</div>
          ) : (
            upcoming.slice(0, 3).map(b => (
              <div key={b.id} style={{ background: "#1E1E35", borderRadius: 10, padding: 12, marginBottom: 8, display: "flex", gap: 12 }}>
                <div style={{ background: "#2A2A45", borderRadius: 8, padding: "8px 12px", textAlign: "center", minWidth: 60 }}>
                  <div style={{ color: "#FF6B35", fontWeight: 800, fontSize: 16 }}>{b.time?.slice(0, 5)}</div>
                  <div style={{ fontSize: 10, color: "#A0A0C0" }}>{b.date}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{b.zoneEmoji} {b.zoneName}</div>
                  {b.childName && b.childName !== "—" && <div style={{ fontSize: 12, color: "#A0A0C0" }}>Child: {b.childName}</div>}
                  <div style={{ fontSize: 12, color: "#A0A0C0" }}>${b.totalPrice}</div>
                </div>
                <button onClick={() => navigate("/visitor/tickets")}
                  style={{ background: "rgba(255,107,53,0.12)", border: "none", color: "#FF6B35", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>QR</button>
              </div>
            ))
          )}
          <button onClick={() => navigate("/visitor/booking")}
            style={{ width: "100%", marginTop: 8, padding: 11, background: "linear-gradient(135deg,#FF6B35,#e55a24)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            + Book New Session
          </button>
        </div>

        {/* Zone occupancy */}
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>📊 Zone Occupancy</div>
          {loading ? (
            <div style={{ color: "#A0A0C0", fontSize: 14, textAlign: "center", padding: "20px 0" }}>Loading…</div>
          ) : zones.length === 0 ? (
            <div style={{ color: "#A0A0C0", fontSize: 14, textAlign: "center", padding: "20px 0" }}>No zones found. Seed the database first.</div>
          ) : (
            zones.slice(0, 5).map(z => (
              <div key={z.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{z.emoji} {z.name}</span>
                  <span style={{ fontSize: 12, color: "#A0A0C0" }}>{z.currentOccupancy}/{z.capacity}</span>
                </div>
                <div style={{ height: 6, background: "#2A2A45", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((z.currentOccupancy / z.capacity) * 100, 100)}%`, background: z.currentOccupancy / z.capacity > 0.8 ? "#EF4444" : "#FF6B35", borderRadius: 4 }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick nav */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, marginTop: 20 }}>
        {[
          { icon: "🍔", label: "Food & Drinks", path: "/visitor/food" },
          { icon: "🎉", label: "Events", path: "/visitor/events" },
          { icon: "⭐", label: "Rewards", path: "/visitor/rewards" },
          { icon: "🤖", label: "AI Picks", path: "/visitor/ai" },
          { icon: "🆘", label: "Support", path: "/visitor/support" },
          { icon: "🗺️", label: "Park Map", path: "/visitor/map" },
        ].map(({ icon, label, path }) => (
          <button key={path} onClick={() => navigate(path)}
            style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 10px", cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#F0F0FF" }}>{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
