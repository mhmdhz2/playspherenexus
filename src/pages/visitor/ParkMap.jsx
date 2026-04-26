// src/pages/visitor/ParkMap.jsx
import React from "react";

export default function ParkMap() {
  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Park Map 🗺️</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>📍 Interactive Map</div>
          <svg viewBox="0 0 500 380" style={{ width: "100%", borderRadius: 12, background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.06)" }}>
            <rect width="500" height="380" fill="#1a1a2e" rx="12"/>
            {/* Corridors */}
            <rect x="70" y="35" width="360" height="10" rx="5" fill="#2a2a45" opacity="0.8"/>
            <rect x="240" y="35" width="10" height="310" rx="5" fill="#2a2a45" opacity="0.8"/>
            <rect x="70" y="335" width="360" height="10" rx="5" fill="#2a2a45" opacity="0.8"/>
            {/* Zone 1: Trampoline */}
            <rect x="20" y="20" width="145" height="115" rx="10" fill="rgba(255,107,53,0.12)" stroke="#FF6B35" strokeWidth="1.5"/>
            <text x="92" y="68" textAnchor="middle" fill="#FF6B35" fontSize="26">🤸</text>
            <text x="92" y="90" textAnchor="middle" fill="#FF6B35" fontSize="11" fontWeight="bold">Trampoline Zone</text>
            <text x="92" y="108" textAnchor="middle" fill="rgba(255,107,53,0.7)" fontSize="10">72% Full</text>
            {/* Zone 2: Climbing */}
            <rect x="180" y="20" width="145" height="115" rx="10" fill="rgba(6,214,160,0.12)" stroke="#06D6A0" strokeWidth="1.5"/>
            <text x="252" y="68" textAnchor="middle" fill="#06D6A0" fontSize="26">🧗</text>
            <text x="252" y="90" textAnchor="middle" fill="#06D6A0" fontSize="11" fontWeight="bold">Climbing Wall</text>
            <text x="252" y="108" textAnchor="middle" fill="rgba(6,214,160,0.7)" fontSize="10">45% Full</text>
            {/* Zone 3: Ball Pit */}
            <rect x="340" y="20" width="140" height="115" rx="10" fill="rgba(255,183,3,0.12)" stroke="#FFB703" strokeWidth="1.5"/>
            <text x="410" y="68" textAnchor="middle" fill="#FFB703" fontSize="26">⚽</text>
            <text x="410" y="90" textAnchor="middle" fill="#FFB703" fontSize="11" fontWeight="bold">Ball Pit Zone</text>
            <text x="410" y="108" textAnchor="middle" fill="rgba(255,183,3,0.7)" fontSize="10">90% Full!</text>
            {/* Zone 4: Foam Pit */}
            <rect x="20" y="155" width="145" height="115" rx="10" fill="rgba(96,165,250,0.12)" stroke="#60a5fa" strokeWidth="1.5"/>
            <text x="92" y="203" textAnchor="middle" fill="#60a5fa" fontSize="26">🌊</text>
            <text x="92" y="225" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="bold">Foam Pit Arena</text>
            <text x="92" y="243" textAnchor="middle" fill="rgba(96,165,250,0.7)" fontSize="10">40% Full</text>
            {/* Zone 5: Games */}
            <rect x="180" y="155" width="145" height="115" rx="10" fill="rgba(167,139,250,0.12)" stroke="#a78bfa" strokeWidth="1.5"/>
            <text x="252" y="203" textAnchor="middle" fill="#a78bfa" fontSize="26">🎮</text>
            <text x="252" y="225" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="bold">Interactive Games</text>
            <text x="252" y="243" textAnchor="middle" fill="rgba(167,139,250,0.7)" fontSize="10">40% Full</text>
            {/* Zone 6: Carousel (maintenance) */}
            <rect x="340" y="155" width="140" height="115" rx="10" fill="rgba(239,68,68,0.07)" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="5"/>
            <text x="410" y="203" textAnchor="middle" fill="#EF4444" fontSize="26">🎠</text>
            <text x="410" y="225" textAnchor="middle" fill="#EF4444" fontSize="11" fontWeight="bold">Carousel Zone</text>
            <text x="410" y="243" textAnchor="middle" fill="rgba(239,68,68,0.7)" fontSize="10">⚠ Maintenance</text>
            {/* Bottom row */}
            <rect x="20" y="290" width="145" height="70" rx="10" fill="rgba(255,183,3,0.08)" stroke="#FFB703" strokeWidth="1.5"/>
            <text x="92" y="322" textAnchor="middle" fill="#FFB703" fontSize="18">🍔</text>
            <text x="92" y="345" textAnchor="middle" fill="#FFB703" fontSize="10" fontWeight="bold">Food Court</text>
            <rect x="180" y="290" width="145" height="70" rx="10" fill="rgba(6,214,160,0.08)" stroke="#06D6A0" strokeWidth="2"/>
            <text x="252" y="322" textAnchor="middle" fill="#06D6A0" fontSize="18">🚪</text>
            <text x="252" y="345" textAnchor="middle" fill="#06D6A0" fontSize="10" fontWeight="bold">Main Entrance</text>
            <rect x="340" y="290" width="140" height="70" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
            <text x="410" y="322" textAnchor="middle" fill="#A0A0C0" fontSize="18">🚻</text>
            <text x="410" y="345" textAnchor="middle" fill="#A0A0C0" fontSize="10">Restrooms</text>
            {/* Animated user location */}
            <circle cx="252" cy="305" r="10" fill="#FF6B35" opacity="0.3">
              <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="252" cy="305" r="5" fill="#FF6B35"/>
            <text x="268" y="302" fill="#FF6B35" fontSize="9" fontWeight="bold">📍 You</text>
          </svg>
        </div>
        <div>
          <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>🔍 Directions</div>
            {[
              ["🤸 Trampoline Zone","50m straight →","#FF6B35"],
              ["🍔 Food Court","30m left ↓","#FFB703"],
              ["🚻 Restrooms","40m right →","#A0A0C0"],
              ["🆘 Help Desk","Near entrance","#EF4444"],
            ].map(([place, dir, color]) => (
              <div key={place} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{place}</span>
                <span style={{ fontSize: 12, color, fontWeight: 700 }}>{dir}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>📍 Your Location</div>
            <div style={{ background: "#1E1E35", borderRadius: 10, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📍</div>
              <div style={{ fontWeight: 700 }}>Near Main Entrance</div>
              <div style={{ fontSize: 12, color: "#A0A0C0", marginTop: 4 }}>Location based on nearest beacon</div>
              <span style={{ background: "rgba(6,214,160,0.15)", color: "#06D6A0", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "inline-block", marginTop: 10 }}>● Location Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
