import React from "react";
import { useApi } from "@/hooks/useApi";
import { analyticsService } from "@/services";
import { Spinner, Alert } from "@/components/ui";
import { SelfVsActualChart } from "@/components/charts";
import { formatPercent } from "@/utils/helpers";
import { Users, ClipboardCheck, FileText, TrendingUp, Target, Zap } from "lucide-react";
import MagicBento from "@/component/MagicBento/MagicBento";
import BubbleMenu from "@/component/BubbleMenu/BubbleMenu";

import LineWaves from "@/component/LineWaves/LineWaves";

export default function AdminDashboard() {
  const { data: overview, loading: ol, error: oe } = useApi(() => analyticsService.getOverview());
  const { data: svA, loading: cl } = useApi(() => analyticsService.getSelfVsActual());

  if (ol) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const o = overview || {};
  const chartData = svA?.data?.filter((d) => d.selfScore != null && d.actualScore != null) ?? [];

  const bentoCardData = [
    { title: "Total Employees", value: o.totalEmployees ?? "—", icon: Users, color: "#120F17" },
    { title: "Self Assessments", value: o.selfAssessmentsCompleted ?? "—", subtitle: "completed", icon: ClipboardCheck, color: "#120F17" },
    { title: "Tests Completed", value: o.testsCompleted ?? "—", subtitle: "completed", icon: FileText, color: "#120F17" },
    { title: "Avg Self Assessment Score", value: o.avgSelfScore != null ? formatPercent(o.avgSelfScore) : "—", icon: TrendingUp, color: "#120F17" },
    { title: "Avg Test Score", value: o.avgActualScore != null ? formatPercent(o.avgActualScore) : "—", icon: Target, color: "#120F17" },
    { title: "Avg Accuracy Index", value: o.avgAccuracyIndex != null ? formatPercent(o.avgAccuracyIndex) : "—", subtitle: "platform CAI", icon: Zap, color: "#120F17" }
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 👉 THE LINE WAVES BACKGROUND LAYER */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none', backgroundColor: '#050505' }}>
        <LineWaves
          speed={0.4}
          innerLineCount={36}
          outerLineCount={40}
          warpIntensity={1.2}
          rotation={-30}
          edgeFadeWidth={0.0}
          colorCycleSpeed={1.0}
          brightness={0.25}
          color1="#8400ff"
          color2="#00c6ff"
          color3="#0072ff"
          enableMouseInteraction={true}
          mouseInfluence={2.0}
        />
      </div>

      <div className="space-y-6 p-6">
        <div className="page-header">
          <h3 style={{ color: "black" }}>.</h3>
          <h1 className="page-title" style={{ color: 'white', fontSize: '42px' }}>Dashboard</h1>
          <p className="page-subtitle" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>Overview and analytics</p>
          <br></br>
          <br></br>
          <br></br>
        </div>

        {oe && <Alert type="error" message={oe} />}

        {/* Stats grid */}
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
        <h3 style={{ color: "black" }}>.</h3>
        {/* Self vs Actual chart */}
        <div className="card p-5 mt-10" style={{ backgroundColor: 'rgba(18, 15, 23, 0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ color: "black" }}>.</h3>
          <h2 className="section-title" style={{ color: 'white' }}>Self Assessment vs Test Score — Total Employees</h2>
          {cl ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : chartData.length > 0 ? (
            <SelfVsActualChart data={chartData} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-10">No completed assessments yet.</p>
          )}
        </div>

        <BubbleMenu
          menuBg="#8400ff"
          menuContentColor="#ffffff"
          items={[
            { label: 'Employees', href: '/admin/employees', rotation: 0, hoverStyles: { bgColor: '#a855f7', textColor: '#ffffff' } },
            { label: 'Questions', href: '/admin/questions', rotation: 0, hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' } },
            { label: 'Analytics', href: '/admin/analytics', rotation: 0, hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' } }
          ]}
        />
      </div>
    </div>
  );
}
