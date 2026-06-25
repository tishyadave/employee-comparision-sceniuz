import React from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { testService } from "@/services";
import { CAIMeter, ScoreRing, Spinner, Alert } from "@/components/ui";
import { SelfVsActualChart, SkillRadarChart } from "@/components/charts";
import { formatPercent, formatDuration, getGapLabel } from "@/utils/helpers";
import { Trophy, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";

import Dither from "@/component/Dither/Dither";

const DITHER_WAVE_COLOR = [0.15, 0.35, 0.75];

// Azure/Blue aesthetic with Cyan replacing the Orange/Yellow
const glassCardStyle = {
  backgroundColor: 'rgba(15, 18, 23, 0.85)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(59, 130, 246, 0.25)',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.05), 0 0 12px 2px rgba(37, 99, 235, 0.1), 0 4px 20px rgba(0,0,0,0.3)'
};

const buttonStyle = {
  display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
  padding: '12px 24px', borderRadius: '12px',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: 'none', cursor: 'pointer',
  boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)',
  fontWeight: 'normal', fontSize: '15px', transition: 'all 0.3s'
};

const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: 'rgba(255,255,255,0.05)',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: 'none'
};

export default function ResultsPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useApi(() => testService.getResults());

  if (loading) return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505' }}>
      <Spinner size="lg" />
    </div>
  );

  if (error) return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '64px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#050505' }}>
      <div style={{ ...glassCardStyle, maxWidth: '500px', width: '100%', textAlign: 'center', borderColor: 'rgba(248,113,113,0.3)' }}>
        <Alert type="error" message={error} />
        <button onClick={() => navigate("/dashboard")} style={{ ...secondaryButtonStyle, marginTop: '20px', width: '100%' }}>Back to Dashboard</button>
      </div>
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

  // Styling logic for the Gap Card (Replaced Yellow/Orange with Cyber Cyan #06b6d4)
  const isOverconfident = gap > 10;
  const isUnderconfident = gap < -10;
  const gapColor = isOverconfident ? '#06b6d4' : (isUnderconfident ? '#3b82f6' : '#10b981');
  const gapBg = isOverconfident ? 'rgba(6, 182, 212, 0.1)' : (isUnderconfident ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)');
  const gapBorder = isOverconfident ? 'rgba(6, 182, 212, 0.3)' : (isUnderconfident ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)');

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Background Layer - Dithered waves */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundColor: '#050505' }}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <Dither
            waveColor={DITHER_WAVE_COLOR}
            disableAnimation={false}
            enableMouseInteraction={true}
            mouseRadius={0.4}
            colorNum={4}
            waveAmplitude={0.5}
            waveFrequency={4}
            waveSpeed={0.25}
          />
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <p><br /></p>
          <h1 style={{ fontSize: '40px', color: '#ffffff', margin: 0, fontWeight: 'normal' }}>Your Results</h1>
          <p><br /> </p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 'normal', lineHeight: '1.5' }}>
            Completed in {formatDuration(attempt?.timeTakenSeconds)} · {attempt?.correctAnswers}/{attempt?.totalQuestions} correct
          </p>
        </div>

        {/* Score Summary Rings */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div style={{ ...glassCardStyle, display: 'flex', justifyContent: 'center' }}>
            <ScoreRing value={selfScore ?? 0} label="Self Assessment" size={130} color="#3b82f6" />
          </div>
          <div style={{ ...glassCardStyle, display: 'flex', justifyContent: 'center' }}>
            <CAIMeter value={cai} />
          </div>
          <div style={{ ...glassCardStyle, display: 'flex', justifyContent: 'center', borderColor: 'rgba(16, 185, 129, 0.25)', boxShadow: '0 0 0 1px rgba(16,185,129,0.05), 0 0 12px 2px rgba(16,185,129,0.1), 0 4px 20px rgba(0,0,0,0.3)' }}>
            <ScoreRing value={actualScore ?? 0} label="MCQ Test Score" size={130} color="#10b981" />
          </div>
        </div>

        {/* Gap Summary */}
        {gap != null && (
          <div style={{
            backgroundColor: gapBg, backdropFilter: 'blur(12px)', border: `1px solid ${gapBorder}`,
            borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: gapColor, padding: '12px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                {gap > 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              </div>
              <div>
                <p style={{ fontSize: '16px', color: '#ffffff', margin: '0 0 4px 0', fontWeight: 'normal' }}>
                  {getGapLabel(gap)} ({gap > 0 ? "+" : ""}{gap.toFixed(1)}%)
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 'normal' }}>
                  {gap > 10 ? "You rated yourself higher than your test performance." : gap < -10 ? "You underestimated your own abilities!" : "Your self-perception closely matches your actual performance."}
                </p>
              </div>
            </div>
            <span style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
              backgroundColor: gapBg, color: gapColor, border: `1px solid ${gapColor}`, fontWeight: 'normal'
            }}>
              {getGapLabel(gap)}
            </span>
          </div>
        )}

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          {barData.length > 0 && (
            <div style={glassCardStyle}>
              <h2 style={{ fontSize: '16px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 24px 0', fontWeight: 'normal' }}>
                <div style={{ padding: '6px', backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: '8px', color: '#60a5fa' }}><BarChart2 size={16} /></div>
                Score Comparison
              </h2>
              <SelfVsActualChart data={barData} />
            </div>
          )}
          {radarData.length > 0 && (
            <div style={glassCardStyle}>
              <h2 style={{ fontSize: '16px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 24px 0', fontWeight: 'normal' }}>
                <div style={{ padding: '6px', backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: '8px', color: '#60a5fa' }}><BarChart2 size={16} /></div>
                Skill Radar
              </h2>
              <SkillRadarChart data={radarData} />
            </div>
          )}
        </div>

        {/* Topic Breakdown Table */}
        {topicBreakdown?.length > 0 && (
          <div style={{ ...glassCardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ fontSize: '18px', color: '#ffffff', margin: 0, fontWeight: 'normal' }}>Topic-wise Breakdown</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'normal', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Topic</th>
                    <th style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'normal', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Correct</th>
                    <th style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'normal', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Score</th>
                    <th style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'normal', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {topicBreakdown.map((t) => {
                    const isStrong = t.percentage >= 75;
                    const isMod = t.percentage >= 50 && t.percentage < 75;
                    // Replaced Yellow/Orange with Cyber Cyan
                    const tagColor = isStrong ? '#10b981' : isMod ? '#06b6d4' : '#f87171';
                    const tagBg = isStrong ? 'rgba(16, 185, 129, 0.15)' : isMod ? 'rgba(6, 182, 212, 0.15)' : 'rgba(248, 113, 113, 0.15)';

                    return (
                      <tr key={t.topic} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '16px 24px', color: '#ffffff', fontSize: '14px', fontWeight: 'normal' }}>{t.topic}</td>
                        <td style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 'normal' }}>{t.correct} / {t.total}</td>
                        <td style={{ padding: '16px 24px', color: tagColor, fontSize: '15px', fontWeight: 'normal' }}>{formatPercent(t.percentage)}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', backgroundColor: tagBg, color: tagColor, border: `1px solid ${tagColor}40`, fontWeight: 'normal' }}>
                            {isStrong ? "Strong" : isMod ? "Moderate" : "Needs work"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Strengths & Improvements */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={glassCardStyle}>
            <h3 style={{ fontSize: '15px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontWeight: 'normal' }}>
              <TrendingUp size={16} /> Strengths
            </h3>
            {strengths.length > 0 ? (
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {strengths.map((t) => (
                  <li key={t.topic} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'normal' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{t.topic}</span>
                    <span style={{ color: '#10b981' }}>{formatPercent(t.percentage)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 'normal' }}>Keep practicing to build strengths!</p>
            )}
          </div>

          <div style={glassCardStyle}>
            {/* Replaced Yellow/Orange with Cyber Cyan */}
            <h3 style={{ fontSize: '15px', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontWeight: 'normal' }}>
              <TrendingDown size={16} /> Areas for Improvement
            </h3>
            {improvements.length > 0 ? (
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {improvements.map((t) => (
                  <li key={t.topic} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'normal' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{t.topic}</span>
                    <span style={{ color: '#06b6d4' }}>{formatPercent(t.percentage)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 'normal' }}>Great job — no major weak areas!</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate("/leaderboard")} style={buttonStyle}>
            <Trophy size={16} /> View Leaderboard
          </button>
          <button onClick={() => navigate("/dashboard")} style={secondaryButtonStyle}>
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
