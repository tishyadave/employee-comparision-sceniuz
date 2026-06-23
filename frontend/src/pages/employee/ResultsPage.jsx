import React from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { testService } from "@/services";
import { CAIMeter, ScoreRing, Spinner, Alert, Badge } from "@/components/ui";
import { SelfVsActualChart, SkillRadarChart } from "@/components/charts";
import { formatPercent, formatDuration, getScoreColor, getGapLabel, getGapColor } from "@/utils/helpers";
import { Trophy, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";

// 👉 REACT BITS: Wrap score reveal section with <MagicCard> from React Bits
// 👉 REACT BITS: Add <CountUp> number animations for the score values

export default function ResultsPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useApi(() => testService.getResults());

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (error) return (
    <div className="max-w-lg mx-auto mt-16 space-y-4">
      <Alert type="error" message={error} />
      <button onClick={() => navigate("/dashboard")} className="btn-secondary">Back to Dashboard</button>
    </div>
  );

  const { attempt, selfAssessment, cai, topicBreakdown, skillMapping } = data || {};
  const selfScore = selfAssessment?.overallPercentage ?? null;
  const actualScore = attempt?.scorePercentage ?? null;
  const gap = selfScore != null && actualScore != null ? selfScore - actualScore : null;

  // Prepare radar data
  const radarData = topicBreakdown?.map((t) => ({
    subject: t.topic,
    actual: t.percentage,
    self: skillMapping?.[t.topic] != null ? parseFloat(skillMapping[t.topic].toFixed(1)) : null,
  })) ?? [];

  // Prepare bar data
  const barData = selfScore != null || actualScore != null
    ? [{ name: "Overall", selfScore, actualScore }]
    : [];

  // Strengths / improvements from topic breakdown
  const sorted = [...(topicBreakdown || [])].sort((a, b) => b.percentage - a.percentage);
  const strengths = sorted.filter((t) => t.percentage >= 70);
  const improvements = sorted.filter((t) => t.percentage < 70);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Your Results</h1>
        <p className="page-subtitle">
          Completed in {formatDuration(attempt?.timeTakenSeconds)} · {attempt?.correctAnswers}/{attempt?.totalQuestions} correct
        </p>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 flex flex-col items-center gap-3">
          <ScoreRing value={selfScore ?? 0} label="Self Assessment" size={120} color="#6366f1" />
        </div>
        <CAIMeter value={cai} />
        <div className="card p-5 flex flex-col items-center gap-3">
          <ScoreRing value={actualScore ?? 0} label="MCQ Test Score" size={120} color="#059669" />
        </div>
      </div>

      {/* Gap summary */}
      {gap != null && (
        <div className={`card p-5 flex items-center justify-between ${getGapColor(gap)}`}>
          <div className="flex items-center gap-3">
            {gap > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <div>
              <p className="font-semibold text-sm">
                {getGapLabel(gap)} ({gap > 0 ? "+" : ""}{gap.toFixed(1)}%)
              </p>
              <p className="text-xs opacity-80">
                {gap > 10
                  ? "You rated yourself higher than your test performance."
                  : gap < -10
                  ? "You underestimated your own abilities!"
                  : "Your self-perception closely matches your actual performance."}
              </p>
            </div>
          </div>
          <Badge variant={gap > 10 ? "warning" : gap < -10 ? "info" : "success"}>
            {getGapLabel(gap)}
          </Badge>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {barData.length > 0 && (
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2">
              <BarChart2 size={16} className="text-brand-500" /> Score Comparison
            </h2>
            <SelfVsActualChart data={barData} />
          </div>
        )}
        {radarData.length > 0 && (
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2">
              <BarChart2 size={16} className="text-brand-500" /> Skill Radar
            </h2>
            <SkillRadarChart data={radarData} />
          </div>
        )}
      </div>

      {/* Topic breakdown */}
      {topicBreakdown?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-200">
            <h2 className="section-title mb-0">Topic-wise Breakdown</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Topic</th>
                <th>Correct</th>
                <th>Score</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {topicBreakdown.map((t) => (
                <tr key={t.topic}>
                  <td className="font-medium text-slate-800">{t.topic}</td>
                  <td>{t.correct} / {t.total}</td>
                  <td>
                    <span className={`font-semibold ${getScoreColor(t.percentage)}`}>
                      {formatPercent(t.percentage)}
                    </span>
                  </td>
                  <td>
                    <Badge
                      variant={t.percentage >= 75 ? "success" : t.percentage >= 50 ? "warning" : "danger"}
                    >
                      {t.percentage >= 75 ? "Strong" : t.percentage >= 50 ? "Moderate" : "Needs work"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
            <TrendingUp size={15} /> Strengths
          </h3>
          {strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map((t) => (
                <li key={t.topic} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{t.topic}</span>
                  <span className="font-semibold text-emerald-600">{formatPercent(t.percentage)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">Keep practicing to build strengths!</p>
          )}
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
            <TrendingDown size={15} /> Areas for Improvement
          </h3>
          {improvements.length > 0 ? (
            <ul className="space-y-2">
              {improvements.map((t) => (
                <li key={t.topic} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{t.topic}</span>
                  <span className="font-semibold text-amber-600">{formatPercent(t.percentage)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">Great job — no major weak areas!</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate("/leaderboard")} className="btn-primary">
          <Trophy size={16} /> View Leaderboard
        </button>
        <button onClick={() => navigate("/dashboard")} className="btn-secondary">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
