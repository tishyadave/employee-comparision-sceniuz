import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { selfAssessmentService } from "@/services";
import { Alert, Spinner, ProgressBar, Badge } from "@/components/ui";
import { SKILL_LABELS, RATING_LABELS } from "@/utils/helpers";
import { Brain, ChevronRight } from "lucide-react";

// 👉 REACT BITS: Replace skill cards with <MagicCard> hover glow from React Bits
// 👉 REACT BITS: Add <AnimatedList> staggered entrance for skill rows

const SKILLS = Object.keys(SKILL_LABELS);

const RATING_COLORS = {
  1: { ring: "ring-red-400", bg: "bg-red-500", label: "text-red-600" },
  2: { ring: "ring-orange-400", bg: "bg-orange-500", label: "text-orange-600" },
  3: { ring: "ring-amber-400", bg: "bg-amber-500", label: "text-amber-600" },
  4: { ring: "ring-blue-400", bg: "bg-blue-500", label: "text-blue-600" },
  5: { ring: "ring-emerald-400", bg: "bg-emerald-500", label: "text-emerald-600" },
};

function RatingSelector({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => {
        const selected = value === n;
        const colors = RATING_COLORS[n];
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`
              h-10 w-10 rounded-xl text-sm font-bold transition-all duration-150
              ${selected
                ? `${colors.bg} text-white ring-2 ${colors.ring} ring-offset-1 scale-110 shadow-md`
                : "bg-surface-100 text-slate-500 hover:bg-surface-200"
              }
            `}
            title={RATING_LABELS[n]}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand-50 rounded-lg">
            <Brain size={20} className="text-brand-600" />
          </div>
          <h1 className="page-title">Self Assessment</h1>
        </div>
        <p className="text-sm text-slate-500">
          Rate your current skill level honestly. This will be compared against your actual MCQ test result.
        </p>
      </div>

      {/* Progress */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Progress</span>
          <span className="text-sm text-slate-500">{completed} / {SKILLS.length} rated</span>
        </div>
        <ProgressBar value={completed} max={SKILLS.length} color="brand" />
      </div>

      {/* Rating scale legend */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Rating Scale</p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={`badge bg-surface-100 ${RATING_COLORS[n].label} font-medium`}>
              {n} — {RATING_LABELS[n]}
            </span>
          ))}
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Skill rating form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {SKILLS.map((skill) => {
          const rating = ratings[skill];
          const colors = rating > 0 ? RATING_COLORS[rating] : null;
          return (
            <div key={skill} className="card p-5 flex items-center justify-between gap-4 animate-fade-in">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">{SKILL_LABELS[skill]}</h3>
                  {rating > 0 && (
                    <Badge variant="default" className={`${colors.label} bg-transparent text-xs`}>
                      {RATING_LABELS[rating]}
                    </Badge>
                  )}
                </div>
                {rating === 0 && (
                  <p className="text-xs text-slate-400 mt-0.5">Select your level</p>
                )}
              </div>
              <RatingSelector
                value={rating}
                onChange={(val) => setRatings((p) => ({ ...p, [skill]: val }))}
              />
            </div>
          );
        })}

        {/* Submit */}
        <div className="card p-5 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Ready to submit?</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {allDone ? "All skills rated. You can submit now." : `Rate ${SKILLS.length - completed} more skill(s) to continue.`}
              </p>
            </div>
            <button
              type="submit"
              disabled={!allDone || submitting}
              className="btn-primary gap-2"
            >
              {submitting ? <Spinner size="sm" /> : <>Submit <ChevronRight size={16} /></>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
