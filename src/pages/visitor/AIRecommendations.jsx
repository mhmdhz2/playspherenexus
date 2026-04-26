// src/pages/visitor/AIRecommendations.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getZones, getChildProfiles } from "../../services/firebase";

// ─── To enable the real Claude AI assistant ───────────────────────────────────
// 1. Create a free account at https://console.anthropic.com
// 2. Generate an API key
// 3. Replace "YOUR_ANTHROPIC_API_KEY" below with your actual key
// WARNING: In production, never expose API keys in frontend code.
//          Use a backend proxy (Firebase Cloud Function) instead.
// ─────────────────────────────────────────────────────────────────────────────
const ANTHROPIC_API_KEY = "YOUR_ANTHROPIC_API_KEY";

export default function AIRecommendations() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [children, setChildren] = useState([]);
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    getZones().then(setZones);
    if (currentUser) getChildProfiles(currentUser.uid).then(setChildren);
  }, [currentUser]);

  useEffect(() => {
    if (zones.length > 0) generateLocalRecs();
  }, [zones, children]);

  const generateLocalRecs = () => {
    const available = zones.filter(z => z.status === "active");
    const scored = available.map(z => {
      const occupancyScore = 1 - (z.currentOccupancy / z.capacity);
      const waitScore = z.waitTime === 0 ? 0.3 : -0.1;
      const score = Math.round(((occupancyScore + waitScore) / 1.3) * 100);
      return { ...z, score: Math.max(0, Math.min(100, score)) };
    }).sort((a, b) => b.score - a.score);
    setRecommendations(scored.slice(0, 4));
  };

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAiResponse("");

    const zonesInfo = zones.map(z =>
      `- ${z.emoji} ${z.name}: ${z.currentOccupancy}/${z.capacity} occupied, age ${z.minAge}-${z.maxAge}, $${z.pricePerHour}/hr, wait: ${z.waitTime} min, status: ${z.status}`
    ).join("\n");

    const childrenInfo = children.length > 0
      ? children.map(c => `${c.name} (age ${c.age}, height ${c.height}cm)`).join("; ")
      : "No children profiles added yet";

    const systemPrompt = `You are the PlaySphere Nexus AI assistant for a smart indoor playground. Help parents choose the best zones and plan their visit.

Live park data right now:
${zonesInfo}

Visitor profile:
- Name: ${userProfile?.name || "Guest"}
- Loyalty points: ${userProfile?.loyaltyPoints || 0}
- Children: ${childrenInfo}

Be friendly, helpful and specific. Keep your response under 150 words.`;

    // Try real Claude API first (requires a valid API key above)
    if (ANTHROPIC_API_KEY && ANTHROPIC_API_KEY !== "YOUR_ANTHROPIC_API_KEY") {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-allow-browser": "true"
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 300,
            system: systemPrompt,
            messages: [{ role: "user", content: question }]
          })
        });
        const data = await response.json();
        const text = data.content?.find(b => b.type === "text")?.text;
        if (text) { setAiResponse(text); setLoading(false); return; }
      } catch (_) { /* fall through to local */ }
    }

    // Smart local fallback when no API key set
    await new Promise(r => setTimeout(r, 600));
    const q = question.toLowerCase();
    const activeZones = zones.filter(z => z.status === "active");
    const leastBusy = [...activeZones].sort((a, b) => (a.currentOccupancy / a.capacity) - (b.currentOccupancy / b.capacity))[0];
    const noWait = activeZones.filter(z => z.waitTime === 0);

    let response = "";
    if (q.includes("crowd") || q.includes("busy") || q.includes("quiet") || q.includes("least")) {
      response = leastBusy
        ? `Right now, ${leastBusy.emoji} ${leastBusy.name} is your best bet — it's only ${Math.round((leastBusy.currentOccupancy / leastBusy.capacity) * 100)}% full with no wait time. Perfect for a relaxed visit!`
        : "All zones are quite busy right now. Try visiting during off-peak hours (weekday mornings are usually quieter).";
    } else if (q.includes("wait") || q.includes("queue")) {
      response = noWait.length > 0
        ? `Zones with zero wait time right now: ${noWait.map(z => `${z.emoji} ${z.name}`).join(", ")}. Head there first!`
        : "All zones have short waits right now. The quickest is " + (leastBusy ? leastBusy.name : "unavailable") + ".";
    } else if (children.length > 0) {
      const child = children[0];
      const suitable = activeZones.filter(z => z.minAge <= child.age && z.maxAge >= child.age && z.minHeight <= child.height);
      response = suitable.length > 0
        ? `For ${child.name} (age ${child.age}), I recommend: ${suitable.slice(0, 2).map(z => `${z.emoji} ${z.name}`).join(" or ")}. These match their age and height requirements perfectly!`
        : `I couldn't find a perfect zone match for ${child.name}'s age. Check the Play Zones page for the latest availability.`;
    } else {
      response = leastBusy
        ? `Based on current occupancy, I'd recommend starting with ${leastBusy.emoji} ${leastBusy.name} — it has the most space right now. Add your children's profiles for personalized age-based suggestions!`
        : "Add your children's profiles to get personalized zone recommendations based on their age and height.";
    }
    setAiResponse(response);
    setLoading(false);
    setQuestion("");
  };

  const SUGGESTED = [
    "Which zone is least crowded right now?",
    "Which zones have no wait time?",
    "Plan a 2-hour visit for us",
    "Which zone is best for a 6-year-old?",
  ];

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>AI Recommendations 🤖</h2>
      <p style={{ color: "#A0A0C0", fontSize: 14, marginBottom: 20 }}>Smart suggestions based on live park conditions and your child profiles</p>

      {/* AI Chat */}
      <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.1),#22223A)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 36 }}>🧠</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>PlaySphere AI Assistant</div>
            <div style={{ fontSize: 12, color: "#A0A0C0" }}>Analyzing {zones.filter(z => z.status === "active").length} live zones · {children.length} child profile{children.length !== 1 ? "s" : ""}</div>
          </div>
        </div>

        {/* Suggested questions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {SUGGESTED.map(q => (
            <button key={q} onClick={() => setQuestion(q)}
              style={{ padding: "6px 12px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 20, color: "#c4b5fd", fontSize: 12, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>
              {q}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input value={question} onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && askAI()}
            placeholder="Ask anything about the park…"
            style={{ flex: 1, padding: "11px 14px", background: "#1E1E35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#F0F0FF", fontSize: 14, fontFamily: "'Nunito',sans-serif", outline: "none" }} />
          <button onClick={askAI} disabled={loading || !question.trim()}
            style={{ padding: "11px 20px", background: loading || !question.trim() ? "#2A2A45" : "linear-gradient(135deg,#7C3AED,#6d28d9)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading || !question.trim() ? "default" : "pointer" }}>
            {loading ? "⏳" : "Ask →"}
          </button>
        </div>

        {loading && (
          <div style={{ marginTop: 14, padding: 14, background: "#1E1E35", borderRadius: 12, color: "#A0A0C0", fontSize: 14 }}>
            🧠 Analyzing park conditions…
          </div>
        )}
        {aiResponse && !loading && (
          <div style={{ marginTop: 14, padding: 16, background: "#1E1E35", borderRadius: 12, border: "1px solid rgba(124,58,237,0.2)" }}>
            <div style={{ fontSize: 11, color: "#7C3AED", fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>🤖 PLAYSPHERE AI</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: "#F0F0FF" }}>{aiResponse}</div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top picks */}
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, color: "#06D6A0" }}>⭐ Top Picks Right Now</div>
          {recommendations.map(z => (
            <div key={z.id} style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 28 }}>{z.emoji}</span>
                <span style={{ background: "rgba(6,214,160,0.15)", color: "#06D6A0", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>Match {z.score}%</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{z.name}</div>
              <div style={{ fontSize: 12, color: "#A0A0C0", marginBottom: 2 }}>{z.currentOccupancy}/{z.capacity} occupied · {z.waitTime > 0 ? `${z.waitTime} min wait` : "No wait ✓"}</div>
              <div style={{ fontSize: 12, color: "#A0A0C0", marginBottom: 10 }}>Ages {z.minAge}–{z.maxAge} · ${z.pricePerHour}/hr</div>
              <div style={{ height: 6, background: "#1E1E35", borderRadius: 4, marginBottom: 12, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${z.score}%`, background: "linear-gradient(to right,#06D6A0,#7C3AED)", borderRadius: 4 }} />
              </div>
              <button onClick={() => navigate("/visitor/booking")}
                style={{ width: "100%", padding: "9px 0", background: "linear-gradient(135deg,#FF6B35,#e55a24)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Book This Zone →
              </button>
            </div>
          ))}
        </div>

        {/* Suggested itinerary + children */}
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, color: "#a78bfa" }}>🗓️ Suggested Itinerary</div>
          <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18, marginBottom: 16 }}>
            {recommendations.slice(0, 3).map((z, i) => {
              const startMin = 9 * 60 + i * 70;
              const endMin = startMin + 60;
              const fmt = (m) => {
                const h = Math.floor(m / 60);
                const mm = String(m % 60).padStart(2, "0");
                return `${h > 12 ? h - 12 : h}:${mm} ${h >= 12 ? "PM" : "AM"}`;
              };
              return (
                <div key={z.id} style={{ display: "flex", gap: 12, marginBottom: i < 2 ? 16 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,107,53,0.15)", border: "2px solid #FF6B35", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#FF6B35" }}>{i + 1}</div>
                    {i < 2 && <div style={{ width: 2, flex: 1, background: "rgba(255,255,255,0.06)", marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingBottom: i < 2 ? 16 : 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{z.emoji} {z.name}</div>
                    <div style={{ fontSize: 12, color: "#A0A0C0" }}>{fmt(startMin)} – {fmt(endMin)}</div>
                    <div style={{ fontSize: 11, color: "#06D6A0", marginTop: 2 }}>{z.waitTime === 0 ? "No wait expected ✓" : `~${z.waitTime} min wait`}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {children.length > 0 && (
            <div style={{ background: "#22223A", border: "1px solid rgba(255,183,3,0.2)", borderRadius: 14, padding: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: "#FFB703" }}>👦 Your Children</div>
              {children.map(c => {
                const suitableCount = zones.filter(z => z.status === "active" && z.minAge <= c.age && z.maxAge >= c.age).length;
                return (
                  <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 10, background: "#1E1E35", borderRadius: 10, padding: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,183,3,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👦</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "#A0A0C0" }}>Age {c.age} · {c.height}cm</div>
                      <div style={{ fontSize: 11, color: "#06D6A0", marginTop: 2 }}>{suitableCount} suitable zone{suitableCount !== 1 ? "s" : ""} available</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
