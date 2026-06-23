import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { userService } from "@/services";
import { StatCard, ScoreRing, CAIMeter, Badge, Spinner, Alert } from "@/components/ui";
import { formatPercent } from "@/utils/helpers";
import { Brain, ClipboardCheck, Trophy, ArrowRight, CheckCircle, Clock } from "lucide-react";

// 👉 REACT BITS: Replace the welcome banner with <BlurText> or <TextReveal> for animated greeting
// 👉 REACT BITS: Wrap stat cards with <MagicCard> from React Bits for hover glow effect
// 👉 REACT BITS: Add <AnimatedList> to the action steps section

function StatusBadge({ done }) {
  return done
    ? <Badge variant="success"><CheckCircle size={11} /> Completed</Badge>
    : <Badge variant="warning"><Clock size={11} /> Pending</Badge>;
}

function ActionCard({ icon: Icon, title, description, to, done, disabled }) {
  return (
    <Link
      to={done || disabled ? "#" : to}
      className={`card p-5 flex items-start gap-4 transition-all duration-200 ${done ? "opacity-60" : disabled ? "opacity-40 cursor-not-allowed" : "hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer"}`}
      onClick={(e) => (done || disabled) && e.preventDefault()}
    >
      <div className={`p-2.5 rounded-lg flex-shrink-0 ${done ? "bg-emerald-50" : "bg-brand-50"}`}>
        <Icon size={20} className={done ? "text-emerald-600" : "text-brand-600"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <StatusBadge done={done} />
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      {!done && !disabled && <ArrowRight size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />}
    </Link>
  );
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useApi(() => userService.getDashboard());

  if (loading) return (
    <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
  );

  const d = data || {};
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      {/* 👉 REACT BITS: Replace with <BlurText> animated entrance */}
      <div className="card p-6 gradient-brand text-white">
        <p className="text-sm font-medium text-brand-200">{greeting},</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.name} 👋</h1>
        <p className="text-brand-200 text-sm mt-1">
          {d.selfAssessmentCompleted && d.testCompleted
            ? "You've completed all assessments. Check your results below!"
            : "Complete your self-assessment and MCQ test to see your results."}
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Self Score"
          value={d.selfScore != null ? formatPercent(d.selfScore) : "—"}
          subtitle="Your perceived level"
          color="brand"
        />
        <StatCard
          title="Actual Score"
          value={d.actualScore != null ? formatPercent(d.actualScore) : "—"}
          subtitle="MCQ test result"
          color="success"
        />
        <StatCard
          title="Accuracy Index"
          value={d.cai != null ? formatPercent(d.cai) : "—"}
          subtitle="Self-perception accuracy"
          color={d.cai >= 80 ? "success" : d.cai >= 60 ? "warning" : "danger"}
        />
        <StatCard
          title="Status"
          value={d.testCompleted ? "All done" : d.selfAssessmentCompleted ? "1 / 2" : "0 / 2"}
          subtitle="Assessments completed"
          color="info"
        />
      </div>

      {/* Scores + CAI */}
      {(d.selfScore != null || d.actualScore != null) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5 flex flex-col items-center gap-3">
            <ScoreRing value={d.selfScore ?? 0} label="Self Assessment" size={110} color="#6366f1" />
          </div>
          <div className="card p-5 flex flex-col items-center gap-3">
            <ScoreRing value={d.actualScore ?? 0} label="Actual Score" size={110} color="#059669" />
          </div>
          <CAIMeter value={d.cai} />
        </div>
      )}

      {/* Action Steps */}
      <div>
        <h2 className="section-title">Your Journey</h2>
        <div className="space-y-3">
          <ActionCard
            icon={Brain}
            title="Self Assessment"
            description="Rate yourself on 6 key skills (HTML, CSS, JS, React, Communication, Problem Solving)"
            to="/self-assessment"
            done={d.selfAssessmentCompleted}
          />
          <ActionCard
            icon={ClipboardCheck}
            title="MCQ Test"
            description="Take the 20-question timed test to measure your actual knowledge"
            to="/test"
            done={d.testCompleted}
            disabled={!d.selfAssessmentCompleted}
          />
          <ActionCard
            icon={Trophy}
            title="View Results & Leaderboard"
            description="See your scores, confidence accuracy index, and where you rank"
            to="/results"
            done={false}
            disabled={!d.testCompleted}
          />
        </div>
      </div>
    </div>
  );
}
