import React from "react";
import { useApi } from "@/hooks/useApi";
import { analyticsService } from "@/services";
import { Spinner, Alert } from "@/components/ui";
import { SelfVsActualChart } from "@/components/charts";
import { formatPercent } from "@/utils/helpers";
import { Users, ClipboardCheck, FileText, TrendingUp, Target, Zap } from "lucide-react";
import MagicBento from "@/component/MagicBento/MagicBento";
import BubbleMenu from "@/component/BubbleMenu/BubbleMenu";

export default function AdminDashboard() {
  const { data: overview, loading: ol, error: oe } = useApi(() => analyticsService.getOverview());
  const { data: svA, loading: cl } = useApi(() => analyticsService.getSelfVsActual());

  if (ol) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const o = overview || {};
  const chartData = svA?.data?.filter((d) => d.selfScore != null && d.actualScore != null) ?? [];

  // Same values your StatCard grid was rendering — just reshaped for MagicBento's cardData prop.
  const bentoCardData = [
    {
      title: "Total Employees",
      value: o.totalEmployees ?? "—",
      icon: Users,
      color: "#120F17"
    },
    {
      title: "Self Assessments",
      value: o.selfAssessmentsCompleted ?? "—",
      subtitle: "completed",
      icon: ClipboardCheck,
      color: "#120F17"
    },
    {
      title: "Tests Completed",
      value: o.testsCompleted ?? "—",
      icon: FileText,
      color: "#120F17"
    },
    {
      title: "Avg Self Score",
      value: o.avgSelfScore != null ? formatPercent(o.avgSelfScore) : "—",
      icon: TrendingUp,
      color: "#120F17"
    },
    {
      title: "Avg Actual Score",
      value: o.avgActualScore != null ? formatPercent(o.avgActualScore) : "—",
      icon: Target,
      color: "#120F17"
    },
    {
      title: "Avg Accuracy Index",
      value: o.avgAccuracyIndex != null ? formatPercent(o.avgAccuracyIndex) : "—",
      subtitle: "platform CAI",
      icon: Zap,
      color: "#120F17"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <p style={{ color: 'black' }}>"
          ...
          <br></br>
          "
        </p>
        <h1 className="page-title" style={{ color: 'white' }}> Dashboard</h1>
        <p className="page-subtitle">Overview and analytics</p><br></br>
      </div>

      {oe && <Alert type="error" message={oe} />}

      {/* Stats grid — now MagicBento */}
      <MagicBento
        cardData={bentoCardData}
        textAutoHide={false}
        enableStars={true}
        enableSpotlight={true}
        enableBorderGlow={true}
        enableTilt={true}
        enableMagnetism={true}
        clickEffect={true}
        spotlightRadius={300}
        particleCount={12}
        glowColor="132, 0, 255"
      />
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      {/* Self vs Actual chart */}
      <div className="card p-5">
        <h2 className="section-title" style={{ color: 'white' }}>Self Score vs Actual Score — All Employees</h2>
        {cl ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : chartData.length > 0 ? (
          <SelfVsActualChart data={chartData} />
        ) : (
          <p className="text-sm text-slate-400 text-center py-10">No completed assessments yet.</p>
        )}
      </div>

      {/* Quick nav cards - Now a Bubble Menu */}
      <BubbleMenu
        menuBg="#8400ff"
        menuContentColor="#ffffff"
        items={[
          {
            label: 'Employees',
            href: '/admin/employees',
            rotation: 0, /* <-- Changed from -8 */
            hoverStyles: { bgColor: '#a855f7', textColor: '#ffffff' }
          },
          {
            label: 'Questions',
            href: '/admin/questions',
            rotation: 0,
            hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' }
          },
          {
            label: 'Analytics',
            href: '/admin/analytics',
            rotation: 0, /* <-- Changed from 8 */
            hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' }
          }
        ]}
      />
    </div>
  );
}