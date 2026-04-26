
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logoutUser } from "../services/firebase";

const NAV = {
  visitor: [
    { label: "Dashboard",     icon: "🏠", to: "/visitor" },
    { label: "Book Session",  icon: "📅", to: "/visitor/booking" },
    { label: "My Tickets",    icon: "📲", to: "/visitor/tickets" },
    { label: "Child Profiles",icon: "👧", to: "/visitor/children" },
    { label: "Play Zones",    icon: "🎡", to: "/visitor/zones" },
    { label: "AI Picks",      icon: "🤖", to: "/visitor/ai" },
    { label: "Park Map",      icon: "🗺️", to: "/visitor/map" },
    { label: "Events",        icon: "🎉", to: "/visitor/events" },
    { label: "Rewards",       icon: "⭐", to: "/visitor/rewards" },
    { label: "Food & Drinks", icon: "🍔", to: "/visitor/food" },
    { label: "Support",       icon: "🆘", to: "/visitor/support" },
    { label: "Job Listings",  icon: "💼", to: "/visitor/jobs" },
  ],
  admin: [
    { label: "Dashboard",    icon: "📊", to: "/admin" },
    { label: "Bookings",     icon: "📅", to: "/admin/bookings" },
    { label: "Zones",        icon: "🎡", to: "/admin/zones" },
    { label: "Events",       icon: "🎉", to: "/admin/events" },
    { label: "Users",        icon: "👥", to: "/admin/users" },
    { label: "Analytics",    icon: "📈", to: "/admin/analytics" },
    { label: "Vendors",      icon: "🏪", to: "/admin/vendors" },
    { label: "Lost & Found", icon: "🔍", to: "/admin/lost-found" },
  ],
  staff: [
    { label: "Dashboard",    icon: "🎯", to: "/staff" },
    { label: "Check-In",     icon: "✅", to: "/staff/checkin" },
    { label: "Zones",        icon: "🎡", to: "/staff/zones" },
    { label: "Lost & Found", icon: "🔍", to: "/staff/lost-found" },
  ],
  vendor: [
    { label: "Dashboard",    icon: "🏪", to: "/vendor" },
    { label: "Menu",         icon: "🍽️", to: "/vendor/menu" },
    { label: "Orders",       icon: "📦", to: "/vendor/orders" },
    { label: "Job Listings", icon: "💼", to: "/vendor/jobs" },
  ],
};

const ROLE_COLORS = {
  visitor: "#06D6A0",
  admin:   "#FF6B35",
  staff:   "#a78bfa",
  vendor:  "#FFB703",
};

export default function Layout() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const role = userProfile?.role || "visitor";
  const navItems = NAV[role] || NAV.visitor;
  const roleColor = ROLE_COLORS[role] || "#06D6A0";

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0F0F1A", color: "#F0F0FF", fontFamily: "'Nunito', sans-serif" }}>

      
      {sidebarOpen && isMobile && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 99 }} />
      )}

      
      <aside style={{
        width: 256, background: "#16162A", borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 100,
        transform: (!isMobile || sidebarOpen) ? "none" : "translateX(-100%)",
        transition: "transform 0.3s ease",
      }}>
        
        <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#FF6B35,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎠</div>
          <div>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>
              Play<span style={{ color: "#FF6B35" }}>Sphere</span>
            </div>
            <div style={{ fontSize: 10, color: "#6B6B8A" }}>Nexus Platform</div>
          </div>
        </div>

        
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${roleColor},#7C3AED)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
            {(userProfile?.name || "U")[0].toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userProfile?.name || "User"}</div>
            <div style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${roleColor}22`, color: roleColor, display: "inline-block", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {role}
            </div>
          </div>
        </div>

        {role === "visitor" && (
          <div style={{ margin: "10px 12px", background: "rgba(255,183,3,0.1)", border: "1px solid rgba(255,183,3,0.2)", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <span>⭐</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{userProfile?.loyaltyPoints || 0} loyalty points</span>
          </div>
        )}

        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === `/${role}`}
              onClick={() => isMobile && setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 10, padding: "9px 10px",
                borderRadius: 10, marginBottom: 2, fontSize: 14, fontWeight: 600,
                color: isActive ? roleColor : "#A0A0C0",
                background: isActive ? `${roleColor}18` : "transparent",
                textDecoration: "none", transition: "all 0.15s",
              })}>
              <span style={{ fontSize: 17, width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#A0A0C0", background: "none", border: "none", width: "100%", cursor: "pointer" }}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <div style={{ marginLeft: isMobile ? 0 : 256, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      
        <header style={{ height: 60, background: "#16162A", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", padding: "0 24px", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", color: "#F0F0FF", fontSize: 22, cursor: "pointer", padding: 4 }}>
              ☰
            </button>
          )}
          <div style={{ flex: 1, fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18 }}>
            PlaySphere Nexus
          </div>
          {role === "visitor" && (
            <div style={{ background: "rgba(255,183,3,0.1)", border: "1px solid rgba(255,183,3,0.2)", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 700, color: "#FFB703" }}>
              ⭐ {userProfile?.loyaltyPoints || 0} pts
            </div>
          )}
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            🔔
          </div>
        </header>

        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
