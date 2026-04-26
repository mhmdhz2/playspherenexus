// src/pages/visitor/Jobs.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getJobListings, applyToJob } from "../../services/firebase";

export default function Jobs() {
  const { currentUser, userProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [applied, setApplied] = useState(new Set());
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    getJobListings()
      .then(j => { setJobs(j); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const apply = async (job) => {
    if (!currentUser) {
      setMsg({ type: "error", text: "Please log in to apply for a job." });
      return;
    }
    if (applied.has(job.id)) {
      setMsg({ type: "error", text: "You've already applied to this position." });
      return;
    }
    setApplying(job.id);
    try {
      await applyToJob(job.id, {
        userId: currentUser.uid,
        name: userProfile?.name || "Applicant",
        email: currentUser.email
      });
      setApplied(prev => new Set([...prev, job.id]));
      setMsg({ type: "success", text: `✅ Applied to "${job.title}" at ${job.company}! We'll be in touch within 3 business days.` });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
    setApplying(null);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Job Listings 💼</h2>
      <p style={{ color: "#A0A0C0", fontSize: 14, marginBottom: 20 }}>Open positions at PlaySphere Nexus and in-park vendors</p>

      {msg.text && (
        <div style={{ background: msg.type === "success" ? "rgba(6,214,160,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${msg.type === "success" ? "rgba(6,214,160,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 10, padding: 14, marginBottom: 16, color: msg.type === "success" ? "#06D6A0" : "#f87171", fontWeight: 600 }}>
          {msg.text}
          <button onClick={() => setMsg({ type: "", text: "" })} style={{ float: "right", background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#A0A0C0" }}>Loading listings…</div>
      ) : jobs.length === 0 ? (
        <div style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "60px 40px", textAlign: "center", color: "#A0A0C0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💼</div>
          <p>No job listings at the moment. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {jobs.map(job => {
            const isApplied = applied.has(job.id);
            const isApplying = applying === job.id;
            const open = job.status === "open";
            return (
              <div key={job.id} style={{ background: "#22223A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 32 }}>💼</span>
                  <span style={{ background: open ? "rgba(6,214,160,0.15)" : "rgba(239,68,68,0.15)", color: open ? "#06D6A0" : "#EF4444", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, height: "fit-content" }}>
                    {open ? "● Hiring" : "● Closed"}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{job.title}</div>
                <div style={{ fontSize: 13, color: "#A0A0C0", marginBottom: 2 }}>🏢 {job.company}</div>
                <div style={{ fontSize: 13, color: "#A0A0C0", marginBottom: 2 }}>📍 {job.location}</div>
                <div style={{ fontSize: 13, color: "#A0A0C0", marginBottom: 2 }}>⏱️ {job.type} · {job.salary}</div>
                <div style={{ fontSize: 12, color: "#6B6B8A", margin: "10px 0 14px", lineHeight: 1.6, borderLeft: "2px solid rgba(255,255,255,0.06)", paddingLeft: 10 }}>{job.description}</div>
                <div style={{ fontSize: 12, color: "#FFB703", marginBottom: 14 }}>📋 {job.requirements}</div>
                <button
                  onClick={() => apply(job)}
                  disabled={!open || isApplying || isApplied}
                  style={{ width: "100%", padding: 10, background: isApplied ? "rgba(6,214,160,0.12)" : !open ? "#2A2A45" : isApplying ? "#2A2A45" : "linear-gradient(135deg,#FF6B35,#e55a24)", border: isApplied ? "1px solid rgba(6,214,160,0.3)" : "none", borderRadius: 10, color: isApplied ? "#06D6A0" : !open ? "#6B6B8A" : "#fff", fontSize: 13, fontWeight: 700, cursor: open && !isApplied ? "pointer" : "default" }}>
                  {isApplied ? "✓ Applied!" : isApplying ? "Applying…" : !open ? "Position Closed" : "Apply Now →"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
