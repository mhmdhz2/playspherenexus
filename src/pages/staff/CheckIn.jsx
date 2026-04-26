// src/pages/staff/CheckIn.jsx
import React, { useState } from "react";
import { validateQR } from "../../services/firebase";

export default function CheckIn() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const validate = async (qrCode) => {
    if (!qrCode.trim()) return;
    setLoading(true);
    try {
      const res = await validateQR(qrCode.trim());
      const entry = {
        code: qrCode,
        valid: res.valid,
        name: res.booking?.childName || res.booking?.userName || "Unknown",
        zone: res.booking?.zoneName || "—",
        time: new Date().toLocaleTimeString(),
        reason: res.reason || ""
      };
      setResult(res);
      setHistory(h => [entry, ...h.slice(0,9)]);
    } catch (err) {
      setResult({ valid: false, reason: err.message });
    }
    setLoading(false);
    setCode("");
  };

  const handleSubmit = (e) => { e.preventDefault(); validate(code); };

  // Simulate scan with a real-looking code
  const simulateScan = () => {
    const fakeCodes = ["PSN-INVALID-001", "PSN-DEMO-TEST"];
    validate(fakeCodes[Math.floor(Math.random() * fakeCodes.length)]);
  };

  return (
    <div>
      <h2 style={{ fontFamily:"'Poppins',sans-serif",fontSize:22,fontWeight:800,marginBottom:20 }}>QR Check-In Scanner ✅</h2>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>

        {/* Scanner */}
        <div style={{ background:"#22223A",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:24 }}>
          <div style={{ fontWeight:800,fontSize:16,marginBottom:16 }}>📷 Scan Ticket</div>

          {/* Camera placeholder */}
          <div style={{ width:"100%",aspectRatio:"1",background:"#1E1E35",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",border:"2px dashed rgba(255,255,255,0.1)",marginBottom:20,fontSize:48,cursor:"pointer",flexDirection:"column",gap:12 }}
            onClick={simulateScan}>
            <span>📷</span>
            <span style={{ fontSize:14,color:"#A0A0C0",fontWeight:600 }}>Click to simulate scan</span>
          </div>

          {/* Manual input */}
          <form onSubmit={handleSubmit}>
            <label style={{ display:"block",fontSize:11,fontWeight:800,color:"#A0A0C0",marginBottom:6,textTransform:"uppercase" }}>Or enter code manually</label>
            <div style={{ display:"flex",gap:8 }}>
              <input value={code} onChange={e=>setCode(e.target.value)} placeholder="PSN-2026-TZ-00847"
                style={{ flex:1,padding:"11px 14px",background:"#1E1E35",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,color:"#F0F0FF",fontSize:14,fontFamily:"monospace" }}/>
              <button type="submit" disabled={loading}
                style={{ padding:"11px 18px",background:"linear-gradient(135deg,#FF6B35,#e55a24)",border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>
                {loading ? "…" : "Validate"}
              </button>
            </div>
          </form>

          {/* Result */}
          {result && (
            <div style={{ marginTop:16,background:result.valid?"rgba(6,214,160,0.1)":"rgba(239,68,68,0.1)",border:`1px solid ${result.valid?"rgba(6,214,160,0.3)":"rgba(239,68,68,0.3)"}`,borderRadius:12,padding:16 }}>
              <div style={{ fontSize:28,marginBottom:8 }}>{result.valid?"✅":"❌"}</div>
              {result.valid ? (
                <>
                  <div style={{ fontWeight:800,fontSize:16,color:"#06D6A0" }}>Valid Ticket!</div>
                  <div style={{ fontSize:13,color:"#A0A0C0",marginTop:4 }}>
                    Child: {result.booking?.childName || "—"}<br/>
                    Zone: {result.booking?.zoneName}<br/>
                    Time: {result.booking?.time}
                  </div>
                  <div style={{ marginTop:8,fontSize:13,fontWeight:700,color:"#06D6A0" }}>✓ Check-in logged</div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight:800,fontSize:16,color:"#EF4444" }}>Invalid Ticket</div>
                  <div style={{ fontSize:13,color:"#A0A0C0",marginTop:4 }}>{result.reason || "QR code not found in system"}</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* History */}
        <div style={{ background:"#22223A",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:24 }}>
          <div style={{ fontWeight:800,fontSize:16,marginBottom:16 }}>📋 Recent Check-ins</div>
          {history.length === 0 ? (
            <div style={{ color:"#A0A0C0",textAlign:"center",padding:"40px 0",fontSize:14 }}>No check-ins yet today.</div>
          ) : (
            history.map((h, i) => (
              <div key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:h.valid?"rgba(6,214,160,0.06)":"rgba(239,68,68,0.06)",borderRadius:10,border:`1px solid ${h.valid?"rgba(6,214,160,0.15)":"rgba(239,68,68,0.15)"}`,marginBottom:8 }}>
                <span style={{ fontSize:18 }}>{h.valid?"✅":"❌"}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700,fontSize:13 }}>{h.name || "Unknown"}</div>
                  <div style={{ fontSize:11,color:"#A0A0C0" }}>{h.zone} • {h.time}</div>
                </div>
                <span style={{ background:h.valid?"rgba(6,214,160,0.15)":"rgba(239,68,68,0.15)",color:h.valid?"#06D6A0":"#EF4444",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20 }}>
                  {h.valid?"Valid":"Invalid"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
