import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell, ReferenceLine,
} from "recharts";

const COLORS = {
  brand: "#4f46e5",
  actual: "#059669",
  self: "#6366f1",
  positive: "#f59e0b",
  negative: "#3b82f6",
  calibrated: "#10b981",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-card-hover px-4 py-3 text-sm">
      <p className="font-semibold text-slate-800 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          {p.name}: <strong>{typeof p.value === "number" ? `${p.value.toFixed(1)}%` : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Self vs Actual Bar Chart ───────────────────────────────────────────────────
export function SelfVsActualChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} barCategoryGap="30%" barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
        <Bar dataKey="selfScore" name="Self Assessment" fill={COLORS.self} radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="actualScore" name="Test Score" fill={COLORS.actual} radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Gap Analysis Bar Chart ────────────────────────────────────────────────────
export function GapChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" domain={[-100, 100]} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
        <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1.5} />
        <Bar dataKey="gap" name="Gap (Self − Actual)" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {data.map((entry, idx) => (
            <Cell
              key={idx}
              fill={entry.gap > 10 ? COLORS.positive : entry.gap < -10 ? COLORS.negative : COLORS.calibrated}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Radar Chart ───────────────────────────────────────────────────────────────
export function SkillRadarChart({ data }) {
  // data = [{ subject, self, actual }]
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#64748b" }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickCount={4} />
        <Radar name="Self Assessment" dataKey="self" stroke={COLORS.self} fill={COLORS.self} fillOpacity={0.15} strokeWidth={2} />
        <Radar name="Test Score" dataKey="actual" stroke={COLORS.actual} fill={COLORS.actual} fillOpacity={0.15} strokeWidth={2} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Question Difficulty Chart ─────────────────────────────────────────────────
export function DifficultyChart({ data }) {
  // Top 10 hardest questions
  const top10 = data.slice(0, 10);
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={top10} layout="vertical" barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
        <YAxis type="category" dataKey="topic" width={90} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
        <Bar dataKey="correctPercentage" name="Correct %" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {top10.map((entry, idx) => (
            <Cell
              key={idx}
              fill={entry.correctPercentage >= 70 ? COLORS.calibrated : entry.correctPercentage >= 40 ? COLORS.positive : "#ef4444"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
