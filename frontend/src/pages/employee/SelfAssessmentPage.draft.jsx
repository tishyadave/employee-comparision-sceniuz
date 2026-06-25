import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { selfAssessmentService } from "@/services";
import { Alert, Spinner } from "@/components/ui";
import { SKILL_LABELS, RATING_LABELS } from "@/utils/helpers";
import { Brain, ChevronRight } from "lucide-react";
import Iridescence from "@/component/Iridescence/Iridescence";

const SKILLS = Object.keys(SKILL_LABELS);

const RATING_COLORS = {
  1: { solid: "#ef4444", glow: "rgba(239, 68, 68, 0.4)", bg: "rgba(239, 68, 68, 0.1)" },
  2: { solid: "#f97316", glow: "rgba(249, 115, 22, 0.4)", bg: "rgba(249, 115, 22, 0.1)" },
  3: { solid: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)", bg: "rgba(245, 158, 11, 0.1)" },
  4: { solid: "#3b82f6", glow: "rgba(59, 130, 246, 0.4)", bg: "rgba(59, 130, 246, 0.1)" },
  5: { solid: "#10b981", glow: "rgba(16, 185, 129, 0.4)", bg: "rgba(16, 185, 129, 0.1)" },
};

function RatingSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const selected = value === n;
        const isHovered = hovered === n;
        const colors = RATING_COLORS[n];
        const shouldGlow = selected || isHovered;

        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            style={{
              height: '42px', width: '42px', borderRadius: '12px',
              fontSize: '15px', fontWeight: 'normal',
              transition: 'all 0.2s ease', cursor: 'pointer',
              backgroundColor: selected ? colors.solid : (isHovered ? colors.bg : 'rgba(255,255,255,0.03)'),
              color: selected ? '#ffffff' : (isHovered ? colors.solid : 'rgba(255,255,255,0.5)'),
              border: shouldGlow ? `1px solid ${colors.solid}` : '1px solid rgba(255,255,255,0.1)',
              boxShadow: shouldGlow ? `0 0 16px ${colors.glow}` : 'none',
              transform: shouldGlow ? 'scale(1.1)' : 'scale(1)'
            }}
            title={RATING_LABELS[n]}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

const IRIDESCENCE_COLOR = [1.2, 0.9, 1.6];

export default function SelfAssessmentPage() {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState(
    Object.fromEntries(SKILLS.map((s) => [s, 0]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const completed = SKILLS.filter((s) => ratings[s] > 0).length;
  const allDone = completed === SKILLS.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allDone) return;
    setSubmitting(true);
    setError("");
    try {
      await selfAssessmentService.submit(ratings);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const glassCardStyle = {
    backgroundColor: 'rgba(18, 15, 23, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 0 0 1px rgba(168,85,247,0.05), 0 0 12px 2px rgba(132,0,255,0.1), 0 4px 20px rgba(0,0,0,0.3)'
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundColor: '#050505' }}>
        <Iridescence
          color={IRIDESCENCE_COLOR}
          mouseReact={true}
          amplitude={0.12}
          speed={0.8}
        />
      </div>

      <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', marginBottom: '8px' }}>
          <p><br /></p>
          <h1 style={{ fontSize: '40px', color: '#ffffff', margin: 0, fontWeight: 'normal' }}>Self Assessment</h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 'normal', lineHeight: '1.5' }}>
            Rate your current skill level honestly. This will be compared against your actual MCQ test result to measure your confidence accuracy.
          </p>
        </div>

        {/* Progress & Legend Container */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>

          {/* Progress Card */}
          <div style={{ ...glassCardStyle, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: 'normal' }}>Completion Progress</span>
              <span style={{ fontSize: '14px', color: '#c084fc', fontWeight: 'normal' }}>{completed} / {SKILLS.length} rated</span>
            </div>
            {/* Custom Inline Progress Bar */}
            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${(completed / SKILLS.length) * 100}%`,
                height: '100%',
                backgroundColor: '#c084fc',
                transition: 'width 0.4s ease',
                boxShadow: '0 0 8px rgba(168,85,247,0.8)'
              }} />
            </div>
          </div>

          {/* Rating Scale Legend */}
          <div style={{ ...glassCardStyle, padding: '20px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', marginTop: 0, fontWeight: 'normal' }}>
              Rating Scale
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} style={{
                  fontSize: '12px', padding: '6px 12px', borderRadius: '20px',
                  backgroundColor: RATING_COLORS[n].bg,
                  color: RATING_COLORS[n].solid,
                  border: `1px solid ${RATING_COLORS[n].glow}`,
                  fontWeight: 'normal'
                }}>
                  {n} — {RATING_LABELS[n]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {error && <Alert type="error" message={error} />}

        {/* Skill Rating Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {SKILLS.map((skill) => {
            const rating = ratings[skill];
            const colors = rating > 0 ? RATING_COLORS[rating] : null;

            return (
              <div key={skill} style={{ ...glassCardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '16px', color: '#ffffff', margin: 0, fontWeight: 'normal' }}>{SKILL_LABELS[skill]}</h3>
                    {rating > 0 && (
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '12px',
                        border: `1px solid ${colors.solid}`, color: colors.solid,
                        fontWeight: 'normal'
                      }}>
                        {RATING_LABELS[rating]}
                      </span>
                    )}
                  </div>
                  {rating === 0 && (
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 'normal' }}>Select your level</p>
                  )}
                </div>

                <RatingSelector
                  value={rating}
                  onChange={(val) => setRatings((p) => ({ ...p, [skill]: val }))}
                />
              </div>
            );
          })}

          {/* Submit Action */}
          <div style={{ ...glassCardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <div>
              <p style={{ fontSize: '15px', color: '#ffffff', margin: '0 0 4px 0', fontWeight: 'normal' }}>Ready to submit?</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 'normal' }}>
                {allDone ? "All skills rated. You can submit now." : `Rate ${SKILLS.length - completed} more skill(s) to continue.`}
              </p>
            </div>
            <button
              type="submit"
              disabled={!allDone || submitting}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '12px',
                backgroundColor: allDone ? '#8400ff' : 'rgba(255,255,255,0.05)',
                color: allDone ? '#ffffff' : 'rgba(255,255,255,0.3)',
                border: allDone ? 'none' : '1px solid rgba(255,255,255,0.1)',
                cursor: (allDone && !submitting) ? 'pointer' : 'not-allowed',
                boxShadow: allDone ? '0 0 20px rgba(132,0,255,0.4)' : 'none',
                fontWeight: 'normal', fontSize: '15px', transition: 'all 0.3s'
              }}
            >
              {submitting ? <Spinner size="sm" /> : <>Submit <ChevronRight size={18} /></>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
