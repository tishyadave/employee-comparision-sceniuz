import React from "react";
import { useApi } from "@/hooks/useApi";
import { analyticsService } from "@/services";
import { Spinner, Alert, Avatar, Badge } from "@/components/ui";
import { SelfVsActualChart, GapChart, DifficultyChart } from "@/components/charts";
import { formatPercent } from "@/utils/helpers";
import { Download, Trophy } from "lucide-react";

// 👉 REACT BITS: Add <AnimatedBeam> between chart cards for a connected data-flow feel

function ChartCard({ title, subtitle, children, loading }) {
  return (
    <div className="card p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : children}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: svA, loading: l1, error: e1 } = useApi(() => analyticsService.getSelfVsActual());
  const { data: gap, loading: l2 } = useApi(() => analyticsService.getGapAnalysis());
  const { data: diff, loading: l3 } = useApi(() => analyticsService.getQuestionDifficulty());
  const { data: top, loading: l4 } = useApi(() => analyticsService.getTopPerformers());

  const handleExport = async () => {
    try { await analyticsService.exportCSV(); }
    catch (err) { console.error("Export failed", err); }
  };

  const svAData = svA?.data?.filter((d) => d.selfScore != null && d.actualScore != null) ?? [];
  const gapData = gap?.data ?? [];
  const diffData = diff?.data ?? [];
  const topData = top?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Platform-wide skill assessment insights</p>
        </div>
        <button onClick={handleExport} className="btn-secondary">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {e1 && <Alert type="error" message={e1} />}

      {/* Chart 1 — Self vs Actual */}
      <ChartCard
        title="Self Assessment vs Actual Score"
        subtitle="Per-employee comparison of perceived vs real skill level"
        loading={l1}
      >
        {svAData.length > 0 ? (
          <SelfVsActualChart data={svAData} />
        ) : (
          <p className="text-sm text-slate-400 text-center py-10">No data available yet.</p>
        )}
      </ChartCard>

      {/* Chart 2 — Gap Analysis */}
      <ChartCard
        title="Gap Analysis — Confidence vs Reality"
        subtitle="Positive gap = overconfident · Negative gap = underconfident · ±10% = well calibrated"
        loading={l2}
      >
        {gapData.length > 0 ? (
          <>
            <div className="flex gap-3 mb-4 flex-wrap">
              {[
                { color: "bg-amber-400", label: "Overconfident (gap > +10%)" },
                { color: "bg-blue-400", label: "Underconfident (gap < −10%)" },
                { color: "bg-emerald-400", label: "Well calibrated" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className={`h-2.5 w-2.5 rounded-sm ${l.color}`} /> {l.label}
                </div>
              ))}
            </div>
            <GapChart data={gapData} />
          </>
        ) : (
          <p className="text-sm text-slate-400 text-center py-10">No data available yet.</p>
        )}
      </ChartCard>

      {/* Chart 3 — Question Difficulty */}
      <ChartCard
        title="Question Difficulty Analysis"
        subtitle="Percentage of employees answering each question correctly (sorted hardest first)"
        loading={l3}
      >
        {diffData.length > 0 ? (
          <>
            <div className="flex gap-3 mb-4 flex-wrap">
              {[
                { color: "bg-red-400", label: "Hard (< 40%)" },
                { color: "bg-amber-400", label: "Medium (40–70%)" },
                { color: "bg-emerald-400", label: "Easy (≥ 70%)" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className={`h-2.5 w-2.5 rounded-sm ${l.color}`} /> {l.label}
                </div>
              ))}
            </div>
            <DifficultyChart data={diffData} />
          </>
        ) : (
          <p className="text-sm text-slate-400 text-center py-10">No attempt data yet.</p>
        )}
      </ChartCard>

      {/* Chart 4 — Top Performers table */}
      <ChartCard
        title="Top Performers"
        subtitle="Top 10 employees ranked by actual MCQ test score"
        loading={l4}
      >
        {topData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3">Rank</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3">Employee</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3">Department</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3">Self Score</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3">Actual Score</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3">CAI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {topData.map((e) => (
                  <tr key={e.email} className="hover:bg-surface-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        {e.rank <= 3 ? (
                          <span className="text-lg">{["🥇","🥈","🥉"][e.rank - 1]}</span>
                        ) : (
                          <span className="text-sm font-semibold text-slate-400 w-6 text-center">#{e.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={e.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{e.name}</p>
                          <p className="text-xs text-slate-400">{e.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-slate-500">{e.department || "—"}</td>
                    <td className="py-3 text-sm font-medium text-brand-600">{formatPercent(e.selfScore)}</td>
                    <td className="py-3 text-sm font-bold text-emerald-600">{formatPercent(e.actualScore)}</td>
                    <td className="py-3">
                      {e.cai != null ? (
                        <Badge variant={e.cai >= 80 ? "success" : e.cai >= 60 ? "warning" : "danger"}>
                          {formatPercent(e.cai, 0)}
                        </Badge>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center py-10 text-slate-400">
            <Trophy size={28} className="mb-2 opacity-40" />
            <p className="text-sm">No completed tests yet.</p>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
