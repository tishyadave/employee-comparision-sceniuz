import React from "react";
import { useApi } from "@/hooks/useApi";
import { analyticsService } from "@/services";
import { StatCard, Spinner, Alert } from "@/components/ui";
import { SelfVsActualChart } from "@/components/charts";
import { formatPercent } from "@/utils/helpers";
import { Users, ClipboardCheck, FileText, TrendingUp, Target, Zap } from "lucide-react";

// 👉 REACT BITS: Add <AnimatedBeam> or <Meteors> background to the header
// 👉 REACT BITS: Wrap stat cards with <MagicCard> for hover glow

export default function AdminDashboard() {
  const { data: overview, loading: ol, error: oe } = useApi(() => analyticsService.getOverview());
  const { data: svA, loading: cl } = useApi(() => analyticsService.getSelfVsActual());

  if (ol) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const o = overview || {};
  const chartData = svA?.data?.filter((d) => d.selfScore != null && d.actualScore != null) ?? [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform-wide overview and analytics</p>
      </div>

      {oe && <Alert type="error" message={oe} />}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Employees" value={o.totalEmployees ?? "—"} icon={Users} color="brand" />
        <StatCard title="Self Assessments" value={o.selfAssessmentsCompleted ?? "—"} subtitle="completed" icon={ClipboardCheck} color="info" />
        <StatCard title="Tests Completed" value={o.testsCompleted ?? "—"} icon={FileText} color="success" />
        <StatCard title="Avg Self Score" value={o.avgSelfScore != null ? formatPercent(o.avgSelfScore) : "—"} icon={TrendingUp} color="warning" />
        <StatCard title="Avg Actual Score" value={o.avgActualScore != null ? formatPercent(o.avgActualScore) : "—"} icon={Target} color="success" />
        <StatCard title="Avg Accuracy Index" value={o.avgAccuracyIndex != null ? formatPercent(o.avgAccuracyIndex) : "—"} subtitle="platform CAI" icon={Zap} color={o.avgAccuracyIndex >= 80 ? "success" : "warning"} />
      </div>

      {/* Self vs Actual chart */}
      <div className="card p-5">
        <h2 className="section-title">Self Score vs Actual Score — All Employees</h2>
        {cl ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : chartData.length > 0 ? (
          <SelfVsActualChart data={chartData} />
        ) : (
          <p className="text-sm text-slate-400 text-center py-10">No completed assessments yet.</p>
        )}
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Manage Employees", desc: "Add, edit, or remove employees", to: "/admin/employees", color: "bg-brand-50 text-brand-700" },
          { label: "Question Bank", desc: "Manage MCQ questions and topics", to: "/admin/questions", color: "bg-emerald-50 text-emerald-700" },
          { label: "Full Analytics", desc: "Gap, difficulty, and top performer charts", to: "/admin/analytics", color: "bg-amber-50 text-amber-700" },
        ].map((card) => (
          <a key={card.to} href={card.to} className="card-hover p-5 block">
            <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold mb-3 ${card.color}`}>
              {card.label}
            </div>
            <p className="text-xs text-slate-500">{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
