import { useApi } from "@/hooks/useApi";
import { analyticsService } from "@/services";
import { Spinner, Alert, Avatar } from "@/components/ui";
import { SelfVsActualChart, GapChart, DifficultyChart } from "@/components/charts";
import { formatPercent } from "@/utils/helpers";
import { Download, Trophy, BarChart3, Target, BrainCircuit } from "lucide-react";
import Aurora from "@/component/Aurora/Aurora";

const AURORA_COLORS = ["#00c6ff", "#0072ff", "#8400ff"];

function ChartCard({ title, subtitle, children, loading, icon: Icon }) {
  return (
    <div style={{
      backgroundColor: 'rgba(18, 15, 23, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(168, 85, 247, 0.25)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 0 0 1px rgba(168,85,247,0.05), 0 0 12px 2px rgba(132,0,255,0.1), 0 4px 20px rgba(0,0,0,0.3)',
    }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {Icon && (
          <div style={{ padding: '8px', backgroundColor: 'rgba(132, 0, 255, 0.15)', borderRadius: '10px', color: '#c084fc', boxShadow: '0 0 8px rgba(168,85,247,0.2)' }}>
            <Icon size={18} />
          </div>
        )}
        <div>
          <h2 style={{ fontSize: '16px', color: '#ffffff', margin: 0, fontWeight: 'normal' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '4px', marginBottom: 0, fontWeight: 'normal' }}>{subtitle}</p>}
        </div>
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>
      ) : children}
    </div>
  );
}

const MEDAL_CONFIG = [
  {
    emoji: "🥇",
    bg: "linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(251,191,36,0.04) 100%)",
    border: "rgba(251,191,36,0.3)",
    glow: "0 0 10px 1px rgba(251,191,36,0.12)",
    rankColor: "#fbbf24",
    badge: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "rgba(251,191,36,0.4)" },
  },
  {
    emoji: "🥈",
    bg: "linear-gradient(135deg, rgba(148,163,184,0.12) 0%, rgba(148,163,184,0.04) 100%)",
    border: "rgba(148,163,184,0.3)",
    glow: "0 0 10px 1px rgba(148,163,184,0.1)",
    rankColor: "#94a3b8",
    badge: { bg: "rgba(148,163,184,0.15)", color: "#cbd5e1", border: "rgba(148,163,184,0.4)" },
  },
  {
    emoji: "🥉",
    bg: "linear-gradient(135deg, rgba(205,127,50,0.12) 0%, rgba(205,127,50,0.04) 100%)",
    border: "rgba(205,127,50,0.3)",
    glow: "0 0 10px 1px rgba(205,127,50,0.1)",
    rankColor: "#cd7f32",
    badge: { bg: "rgba(205,127,50,0.15)", color: "#d97706", border: "rgba(205,127,50,0.4)" },
  },
];

function LeaderboardRow({ e }) {
  const isPodium = e.rank <= 3;
  const cfg = isPodium ? MEDAL_CONFIG[e.rank - 1] : null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '60px 1fr 160px 100px 110px 90px',
      alignItems: 'center',
      padding: isPodium ? '14px 20px' : '10px 20px',
      borderRadius: '12px',
      marginBottom: isPodium ? '8px' : '6px',
      background: isPodium ? cfg.bg : 'rgba(255,255,255,0.02)',
      border: `1px solid ${isPodium ? cfg.border : 'rgba(255,255,255,0.06)'}`,
      boxShadow: isPodium ? cfg.glow : 'none',
      transition: 'background 0.2s',
    }}>
      {/* Rank */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isPodium ? (
          <span style={{ fontSize: '24px', lineHeight: 1 }}>{cfg.emoji}</span>
        ) : (
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%',
            backgroundColor: 'rgba(168,85,247,0.1)',
            border: '1px solid rgba(168,85,247,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal'
          }}>
            {e.rank}
          </span>
        )}
      </div>

      {/* Name + email */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          border: `2px solid ${isPodium ? cfg.border : 'rgba(168,85,247,0.25)'}`,
          boxShadow: isPodium ? cfg.glow : 'none',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          <Avatar name={e.name} size="sm" />
        </div>
        <div>
          <div style={{ color: '#ffffff', fontSize: '13px', letterSpacing: '0.01em', fontWeight: 'normal' }}>{e.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '1px', fontWeight: 'normal' }}>{e.email}</div>
        </div>
      </div>

      {/* Department */}
      <div>
        <span style={{
          fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
          backgroundColor: 'rgba(168,85,247,0.1)',
          border: '1px solid rgba(168,85,247,0.2)',
          color: '#c084fc',
          fontWeight: 'normal'
        }}>
          {e.department || "—"}
        </span>
      </div>

      {/* Self Score */}
      <div style={{ textAlign: 'right' }}>
        <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: 'normal' }}>{formatPercent(e.selfScore)}</span>
      </div>

      {/* Actual Score */}
      <div style={{ textAlign: 'right' }}>
        <span style={{
          color: '#10b981', fontSize: '14px',
          textShadow: isPodium ? '0 0 8px rgba(16,185,129,0.3)' : 'none',
          fontWeight: 'normal'
        }}>{formatPercent(e.actualScore)}</span>
      </div>

      {/* CAI */}
      <div style={{ textAlign: 'right' }}>
        {e.cai != null ? (
          <span style={{
            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'normal',
            backgroundColor: e.cai >= 80 ? 'rgba(16,185,129,0.15)' : e.cai >= 60 ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)',
            border: `1px solid ${e.cai >= 80 ? 'rgba(16,185,129,0.4)' : e.cai >= 60 ? 'rgba(251,191,36,0.4)' : 'rgba(248,113,113,0.4)'}`,
            color: e.cai >= 80 ? '#34d399' : e.cai >= 60 ? '#fbbf24' : '#f87171',
          }}>
            {formatPercent(e.cai, 0)}
          </span>
        ) : <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 'normal' }}>—</span>}
      </div>
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
    <div style={{ position: 'relative', minHeight: '100vh', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* 👉 THE AURORA BACKGROUND LAYER */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundColor: '#050505' }}>
        <Aurora
          colorStops={AURORA_COLORS}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
        <div>
          <h3 style={{ color: "black" }}> . </h3>
          <h1 style={{ fontSize: '42px', color: '#ffffff', margin: 0 }}>Analytics</h1>
          <p style={{ color: "black" }}> . </p>
          <p style={{ fontSize: '20px', color: '#ffffff', marginTop: '8px' }}>Platform-wide skill assessment insights</p>
        </div>
        <button
          onClick={handleExport}
          style={{
            alignItems: 'center', gap: '10px', padding: '10px 25px', borderRadius: '8px', color: '#ffffff', backgroundColor: '#000000ff', border: 'none', cursor: 'pointer', fontSize: '16px', boxShadow: '0 0 12px 3px rgba(164, 0, 255, 0.1), 0 0 28px 6px rgba(164, 0, 255, 0.1)'
          }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {e1 && <Alert type="error" message={e1} />}

      {/* Leaderboard */}
      <ChartCard title="Top Performers Leaderboard" subtitle="Ranking the best skill scores platform-wide" icon={Trophy} loading={l4}>
        {topData.length > 0 ? (
          <div>
            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 160px 100px 110px 90px',
              padding: '0 20px 10px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '10px',
            }}>
              {['Rank', 'Employee', 'Department', 'Self', 'Actual', 'CAI'].map((h, i) => (
                <div key={h} style={{
                  fontSize: '10px', letterSpacing: '1.2px',
                  textTransform: 'uppercase', color: 'rgba(168,85,247,0.7)',
                  textAlign: i >= 3 ? 'right' : 'left',
                  paddingLeft: i === 0 ? '4px' : 0,
                  fontWeight: 'normal'
                }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Podium rows (top 3) */}
            {topData.filter(e => e.rank <= 3).map((e) => (
              <LeaderboardRow key={e.email} e={e} />
            ))}

            {/* Divider */}
            {topData.some(e => e.rank > 3) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'normal' }}>Runners Up</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
              </div>
            )}

            {/* Rest of rows */}
            {topData.filter(e => e.rank > 3).map((e) => (
              <LeaderboardRow key={e.email} e={e} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '30px 0', fontWeight: 'normal' }}>No leaderboard data available.</p>
        )}
      </ChartCard>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <ChartCard title="Self Assessment vs Test Score" subtitle="Per-employee comparison of perceived vs real skill level" icon={BrainCircuit} loading={l1}>
          {svAData.length > 0 ? <SelfVsActualChart data={svAData} /> : <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '30px 0', fontWeight: 'normal' }}>No data available yet.</p>}
        </ChartCard>

        <ChartCard title="Gap Analysis — Confidence vs Reality" subtitle="Positive gap = overconfident · Negative gap = underconfident" icon={Target} loading={l2}>
          {gapData.length > 0 ? (
            <>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 'normal' }}><span style={{ height: '8px', width: '8px', borderRadius: '2px', backgroundColor: '#fbbf24' }}></span> Overconfident</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 'normal' }}><span style={{ height: '8px', width: '8px', borderRadius: '2px', backgroundColor: '#60a5fa' }}></span> Underconfident</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 'normal' }}><span style={{ height: '8px', width: '8px', borderRadius: '2px', backgroundColor: '#34d399' }}></span> Well calibrated</div>
              </div>
              <GapChart data={gapData} />
            </>
          ) : <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '30px 0', fontWeight: 'normal' }}>No data available yet.</p>}
        </ChartCard>
      </div>

      {/* Difficulty Chart */}
      <ChartCard title="Question Difficulty Analysis" subtitle="Percentage of employees answering each question correctly" icon={BarChart3} loading={l3}>
        {diffData.length > 0 ? (
          <>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 'normal' }}><span style={{ height: '8px', width: '8px', borderRadius: '2px', backgroundColor: '#f87171' }}></span> Hard (&lt; 40%)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 'normal' }}><span style={{ height: '8px', width: '8px', borderRadius: '2px', backgroundColor: '#fbbf24' }}></span> Medium (40–70%)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 'normal' }}><span style={{ height: '8px', width: '8px', borderRadius: '2px', backgroundColor: '#34d399' }}></span> Easy (≥ 70%)</div>
            </div>
            <DifficultyChart data={diffData} />
          </>
        ) : <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '30px 0', fontWeight: 'normal' }}>No attempt data yet.</p>}
      </ChartCard>

    </div>
  );
}
