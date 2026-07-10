// pages/SelfAssessmentPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { selfAssessmentService } from "@/services";
import { Alert, Spinner, PageLoader } from "@/components/ui";
import { ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import Iridescence from "@/component/Iridescence/Iridescence";
import { ASSESSMENT_TOPICS } from "@/utils/assessmentTopics";

// ─── Constants ───────────────────────────────────────────────────────────────

const RATING_META = {
  1: { label: "Beginner", solid: "#ef4444", glow: "rgba(239,68,68,0.4)", bg: "rgba(239,68,68,0.1)" },
  2: { label: "Elementary", solid: "#f97316", glow: "rgba(249,115,22,0.4)", bg: "rgba(249,115,22,0.1)" },
  3: { label: "Intermediate", solid: "#f59e0b", glow: "rgba(245,158,11,0.4)", bg: "rgba(245,158,11,0.1)" },
  4: { label: "Advanced", solid: "#3b82f6", glow: "rgba(59,130,246,0.4)", bg: "rgba(59,130,246,0.1)" },
  5: { label: "Expert", solid: "#10b981", glow: "rgba(16,185,129,0.4)", bg: "rgba(16,185,129,0.1)" },
};

const IRIDESCENCE_COLOR = [1.2, 0.9, 1.6];

// ─── Shared styles ────────────────────────────────────────────────────────────

const glass = (extra = {}) => ({
  backgroundColor: "rgba(18,15,23,0.85)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(168,85,247,0.2)",
  borderRadius: "14px",
  boxShadow: "0 0 12px 2px rgba(132,0,255,0.08), 0 4px 20px rgba(0,0,0,0.3)",
  ...extra,
});

// ─── RatingPills ─────────────────────────────────────────────────────────────

function RatingPills({ value, onChange }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const m = RATING_META[n];
        const active = value === n;
        const hover = hovered === n;
        const lit = active || hover;
        return (
          <button
            key={n}
            type="button"
            title={m.label}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            style={{
              width: "34px", height: "34px", borderRadius: "10px",
              fontSize: "13px", cursor: "pointer", transition: "all 0.18s ease",
              backgroundColor: active ? m.solid : hover ? m.bg : "rgba(255,255,255,0.04)",
              color: active ? "#fff" : hover ? m.solid : "rgba(255,255,255,0.4)",
              border: lit ? `1px solid ${m.solid}` : "1px solid rgba(255,255,255,0.08)",
              boxShadow: lit ? `0 0 12px ${m.glow}` : "none",
              transform: lit ? "scale(1.12)" : "scale(1)",
              fontWeight: "normal",
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

// ─── TopicCard ────────────────────────────────────────────────────────────────

function TopicCard({ topic, topicIndex, ratings, onChange }) {
  const [open, setOpen] = useState(false);

  const subtopicCount = topic.subtopics.length;
  const ratedCount = topic.subtopics.filter((s) => (ratings[s.id] || 0) > 0).length;
  const allDone = ratedCount === subtopicCount;
  const progress = ratedCount / subtopicCount;

  return (
    <div style={glass({ overflow: "hidden" })}>
      {/* Topic header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: "14px", padding: "18px 20px",
          backgroundColor: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        {/* Number badge */}
        <span style={{
          flexShrink: 0, width: "28px", height: "28px", borderRadius: "8px",
          backgroundColor: allDone ? "rgba(16,185,129,0.15)" : "rgba(168,85,247,0.12)",
          border: allDone ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(168,85,247,0.3)",
          color: allDone ? "#10b981" : "#c084fc",
          fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "normal",
        }}>
          {allDone ? <CheckCircle2 size={14} /> : topicIndex + 1}
        </span>

        {/* Label + progress */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "15px", color: "#ffffff", fontWeight: "normal",
            marginBottom: "6px", lineHeight: 1.3,
          }}>
            {topic.label}
          </div>
          {/* Mini progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              flex: 1, height: "3px",
              backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "2px",
            }}>
              <div style={{
                width: `${progress * 100}%`, height: "100%", borderRadius: "2px",
                backgroundColor: allDone ? "#10b981" : "#a855f7",
                transition: "width 0.35s ease",
              }} />
            </div>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
              {ratedCount}/{subtopicCount}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <span style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <ChevronDown size={16} />
        </span>
      </button>

      {/* Subtopics */}
      {open && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {topic.subtopics.map((sub, si) => {
            const rating = ratings[sub.id] || 0;
            const meta = rating > 0 ? RATING_META[rating] : null;
            return (
              <div
                key={sub.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: "12px",
                  padding: "14px 20px 14px 62px",
                  borderBottom: si < topic.subtopics.length - 1
                    ? "1px solid rgba(255,255,255,0.04)" : "none",
                  backgroundColor: rating > 0 ? "rgba(255,255,255,0.015)" : "transparent",
                  transition: "background-color 0.2s",
                }}
              >
                {/* Subtopic label + badge */}
                <div style={{ flex: 1, minWidth: "200px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.4, fontWeight: "normal" }}>
                    {sub.label}
                  </span>
                  {meta && (
                    <span style={{
                      fontSize: "10px", padding: "2px 7px", borderRadius: "10px",
                      backgroundColor: meta.bg, color: meta.solid,
                      border: `1px solid ${meta.glow}`, flexShrink: 0, fontWeight: "normal",
                    }}>
                      {meta.label}
                    </span>
                  )}
                </div>
                <RatingPills
                  value={rating}
                  onChange={(val) => onChange(sub.id, val)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ALL_SUBTOPICS = ASSESSMENT_TOPICS.flatMap((t) => t.subtopics.map((s) => ({ ...s, topicId: t.id })));
const TOTAL = ALL_SUBTOPICS.length;

export default function SelfAssessmentPage() {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState(() =>
    Object.fromEntries(ALL_SUBTOPICS.map((s) => [s.id, 0]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    selfAssessmentService.getMine()
      .then((res) => {
        if (!active) return;
        if (res.data?.assessment) {
          navigate("/dashboard", { replace: true });
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        if (active) setChecking(false);
      });
    return () => { active = false; };
  }, [navigate]);

  const completed = useMemo(() => Object.values(ratings).filter((v) => v > 0).length, [ratings]);
  const allDone = completed === TOTAL;

  if (checking) return <PageLoader />;

  const handleChange = (subtopicId, val) => {
    setRatings((prev) => ({ ...prev, [subtopicId]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allDone) return;
    setSubmitting(true);
    setError("");
    try {
      const ratingsPayload = ALL_SUBTOPICS.map((s) => ({
        topicId: s.topicId,
        subtopicId: s.id,
        rating: ratings[s.id],
      }));
      await selfAssessmentService.submit({ ratings: ratingsPayload });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "relative", minHeight: "100vh",
      padding: "32px 20px", display: "flex",
      flexDirection: "column", alignItems: "center",
    }}>
      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", backgroundColor: "#050505" }}>
        <Iridescence color={IRIDESCENCE_COLOR} mouseReact={true} amplitude={0.12} speed={0.8} />
      </div>

      <div style={{ width: "100%", maxWidth: "780px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", paddingTop: "16px", paddingBottom: "8px" }}>
          <h1 style={{ fontSize: "38px", color: "#ffffff", margin: "0 0 12px", fontWeight: "normal" }}>
            Self Assessment
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6, maxWidth: "520px", marginInline: "auto" }}>
            Rate your proficiency across each subtopic. Your self-assessment will be compared against your MCQ test results to compute your Confidence Accuracy Index.
          </p>
        </div>

        {/* Overall progress bar */}
        <div style={glass({ padding: "18px 20px" })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: "normal" }}>Overall Progress</span>
            <span style={{ fontSize: "13px", color: "#c084fc", fontWeight: "normal" }}>{completed} / {TOTAL} subtopics rated</span>
          </div>
          <div style={{ height: "5px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{
              width: `${(completed / TOTAL) * 100}%`, height: "100%",
              backgroundColor: allDone ? "#10b981" : "#a855f7",
              transition: "width 0.4s ease",
              boxShadow: allDone ? "0 0 10px rgba(16,185,129,0.7)" : "0 0 8px rgba(168,85,247,0.8)",
            }} />
          </div>
        </div>

        {/* Rating legend */}
        <div style={glass({ padding: "14px 20px" })}>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 10px", fontWeight: "normal" }}>
            Rating Scale
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[1, 2, 3, 4, 5].map((n) => {
              const m = RATING_META[n];
              return (
                <span key={n} style={{
                  fontSize: "11px", padding: "4px 10px", borderRadius: "16px",
                  backgroundColor: m.bg, color: m.solid,
                  border: `1px solid ${m.glow}`, fontWeight: "normal",
                }}>
                  {n} — {m.label}
                </span>
              );
            })}
          </div>
        </div>

        {error && <Alert type="error" message={error} />}

        {/* Topic cards */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {ASSESSMENT_TOPICS.map((topic, i) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              topicIndex={i}
              ratings={ratings}
              onChange={handleChange}
            />
          ))}

          {/* Submit footer */}
          <div style={glass({ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", marginTop: "8px", flexWrap: "wrap", gap: "16px" })}>
            <div>
              <p style={{ fontSize: "15px", color: "#ffffff", margin: "0 0 4px", fontWeight: "normal" }}>
                {allDone ? "All subtopics rated — ready to submit." : "Complete all subtopics to submit."}
              </p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0, fontWeight: "normal" }}>
                {allDone ? `${TOTAL} subtopics across ${ASSESSMENT_TOPICS.length} topics` : `${TOTAL - completed} remaining`}
              </p>
            </div>
            <button
              type="submit"
              disabled={!allDone || submitting}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "12px 28px", borderRadius: "12px",
                backgroundColor: allDone ? "#8400ff" : "rgba(255,255,255,0.05)",
                color: allDone ? "#ffffff" : "rgba(255,255,255,0.25)",
                border: allDone ? "none" : "1px solid rgba(255,255,255,0.08)",
                cursor: allDone && !submitting ? "pointer" : "not-allowed",
                boxShadow: allDone ? "0 0 24px rgba(132,0,255,0.45)" : "none",
                fontSize: "14px", fontWeight: "normal", transition: "all 0.3s",
              }}
            >
              {submitting ? <Spinner size="sm" /> : "Submit Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}