import React, { useEffect, useRef } from "react";
import { cn, getInitials, formatPercent } from "@/utils/helpers";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

// ── Spinner ────────────────────────────────────────────────────────────────────
export function Spinner({ size = "md", className = "" }) {
  const sizes = { sm: 16, md: 24, lg: 32, xl: 48 };
  const px = sizes[size] ?? 24;
  return (
    <div
      className={className}
      style={{
        width: px, height: px, borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.1)",
        borderTopColor: "#a855f7",
        animation: "spin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

export function PageLoader() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#070B14", overflow: "hidden", position: "relative" }}>

      {/* Ambient glow blobs */}
      <div style={{ position: "absolute", top: "20%", left: "30%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(132,0,255,0.08)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "25%", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(99,102,241,0.06)", filter: "blur(60px)", pointerEvents: "none" }} />

      {/* Center content */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", zIndex: 1 }}>

        {/* Animated ring */}
        <div style={{ position: "relative", width: "72px", height: "72px" }}>
          <svg width="72" height="72" style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}>
            <circle cx="36" cy="36" r="30" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="none" />
            <circle
              cx="36" cy="36" r="30"
              stroke="url(#loaderGrad)" strokeWidth="3" fill="none"
              strokeDasharray="188.5"
              strokeDashoffset="47"
              strokeLinecap="round"
              style={{ animation: "loaderSpin 1.2s linear infinite" }}
            />
            <defs>
              <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8400ff" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </svg>
          {/* Inner dot */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#c084fc", boxShadow: "0 0 12px rgba(192,132,252,0.8)", animation: "loaderPulse 1.2s ease-in-out infinite" }} />
          </div>
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", margin: 0, letterSpacing: "0.3px" }}>Loading</p>
          {/* Animated dots */}
          <div style={{ display: "flex", gap: "5px" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#8400ff", animation: `loaderDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loaderSpin { to { transform: rotate(270deg); } }
        @keyframes loaderPulse { 0%, 100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes loaderDot { 0%, 100% { opacity: 0.2; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-4px); } }
      `}</style>
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  default: { background: "rgba(148,163,184,0.1)", color: "rgba(148,163,184,0.8)", border: "1px solid rgba(148,163,184,0.2)" },
  primary: { background: "rgba(168,85,247,0.12)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.25)" },
  success: { background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" },
  warning: { background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" },
  danger: { background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" },
  info: { background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" },
};

export function Badge({ children, variant = "default", className = "" }) {
  const s = BADGE_STYLES[variant] ?? BADGE_STYLES.default;
  return (
    <span className={className} style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "11px", fontWeight: 500,
      ...s,
    }}>
      {children}
    </span>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = "md", className = "" }) {
  const sizes = { sm: 32, md: 40, lg: 48 };
  const fontSizes = { sm: 11, md: 13, lg: 15 };
  const px = sizes[size] ?? 40;
  return (
    <div className={className} style={{
      width: px, height: px, borderRadius: "50%",
      background: "rgba(168,85,247,0.18)",
      border: "1.5px solid rgba(168,85,247,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#c084fc", fontSize: fontSizes[size] ?? 13,
      fontWeight: 500, flexShrink: 0,
    }}>
      {getInitials(name)}
    </div>
  );
}

// ── Progress Bar ───────────────────────────────────────────────────────────────
const PROGRESS_COLORS = {
  brand: "#a855f7",
  success: "#10b981",
  warning: "#fbbf24",
  danger: "#f87171",
};

export function ProgressBar({ value, max = 100, className = "", color = "brand", showLabel = false }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={className} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: "999px",
          background: PROGRESS_COLORS[color] ?? PROGRESS_COLORS.brand,
          width: `${pct}%`, transition: "width 0.5s ease",
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: "11px", color: "rgba(148,163,184,0.6)", minWidth: "32px", textAlign: "right" }}>
          {pct.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
const STAT_ICON_COLORS = {
  brand: { bg: "rgba(168,85,247,0.12)", color: "#c084fc", border: "rgba(168,85,247,0.2)" },
  success: { bg: "rgba(16,185,129,0.12)", color: "#10b981", border: "rgba(16,185,129,0.2)" },
  warning: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "rgba(251,191,36,0.2)" },
  danger: { bg: "rgba(248,113,113,0.12)", color: "#f87171", border: "rgba(248,113,113,0.2)" },
  info: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.2)" },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = "brand", className = "" }) {
  const ic = STAT_ICON_COLORS[color] ?? STAT_ICON_COLORS.brand;
  return (
    <div className={className} style={{
      background: "rgba(15,20,32,0.9)",
      border: `1px solid ${ic.border}`,
      borderRadius: "14px", padding: "20px 18px",
      display: "flex", flexDirection: "column", gap: "4px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "10px", color: "rgba(148,163,184,0.55)", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>{title}</p>
          <p style={{ fontSize: "26px", fontWeight: 500, color: ic.color, fontFamily: "monospace", margin: 0 }}>{value ?? "—"}</p>
          {subtitle && <p style={{ fontSize: "11px", color: "rgba(148,163,184,0.4)", margin: "5px 0 0" }}>{subtitle}</p>}
        </div>
        {Icon && (
          <div style={{ padding: "10px", borderRadius: "10px", background: ic.bg, border: `1px solid ${ic.border}`, color: ic.color, flexShrink: 0, marginLeft: "12px" }}>
            <Icon size={18} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <p style={{ fontSize: "11px", fontWeight: 500, margin: "4px 0 0", color: trend >= 0 ? "#10b981" : "#f87171" }}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last month
        </p>
      )}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 16px", textAlign: "center" }}>
      {Icon && (
        <div style={{ padding: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "50%", marginBottom: "16px" }}>
          <Icon size={28} color="rgba(148,163,184,0.5)" />
        </div>
      )}
      <h3 style={{ fontSize: "15px", fontWeight: 500, color: "#ffffff", margin: "0 0 6px" }}>{title}</h3>
      {description && <p style={{ fontSize: "13px", color: "rgba(148,163,184,0.6)", margin: 0, maxWidth: "280px", lineHeight: "1.6" }}>{description}</p>}
      {action && <div style={{ marginTop: "16px" }}>{action}</div>}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = "md" }) {
  const overlayRef = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const maxWidths = { sm: "420px", md: "560px", lg: "720px", xl: "960px" };

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
        background: "rgba(7,11,20,0.7)", backdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: maxWidths[size] ?? maxWidths.md,
        background: "rgba(15,20,32,0.98)",
        border: "1px solid rgba(168,85,247,0.2)",
        borderRadius: "16px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#ffffff", margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ padding: "6px", borderRadius: "8px", background: "transparent", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.6)", display: "flex" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ── Alert ──────────────────────────────────────────────────────────────────────
const ALERT_STYLES = {
  error: { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", color: "#f87171", Icon: AlertCircle },
  success: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", color: "#34d399", Icon: CheckCircle },
  warning: { bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)", color: "#fbbf24", Icon: AlertTriangle },
  info: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", color: "#60a5fa", Icon: Info },
};

export function Alert({ type = "info", message, className = "" }) {
  const s = ALERT_STYLES[type] ?? ALERT_STYLES.info;
  if (!message) return null;
  return (
    <div className={className} style={{
      display: "flex", alignItems: "flex-start", gap: "10px",
      padding: "12px 16px", borderRadius: "10px",
      background: s.bg, border: `1px solid ${s.border}`,
      fontSize: "13px", color: s.color, lineHeight: "1.5",
    }}>
      <s.Icon size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
      <span>{message}</span>
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = false }) {
  const btnBase = { padding: "8px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: "none", transition: "opacity 0.15s" };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p style={{ fontSize: "13px", color: "rgba(148,163,184,0.75)", margin: "0 0 24px", lineHeight: "1.6" }}>{message}</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button onClick={onClose} style={{ ...btnBase, background: "rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}>
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          style={{ ...btnBase, background: danger ? "rgba(248,113,113,0.15)" : "rgba(168,85,247,0.15)", color: danger ? "#f87171" : "#c084fc", border: `1px solid ${danger ? "rgba(248,113,113,0.3)" : "rgba(168,85,247,0.3)"}` }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ── Score Ring ─────────────────────────────────────────────────────────────────
export function ScoreRing({ value, label, size = 130, color = "#a855f7" }) {
  const radius = (size - 16) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth="8" fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 500, color: "#ffffff", fontFamily: "monospace" }}>
          {formatPercent(value)}
        </div>
      </div>
      {label && <div style={{ color: "rgba(148,163,184,0.65)", fontSize: "13px" }}>{label}</div>}
    </div>
  );
}

// ── CAI Meter ─────────────────────────────────────────────────────────────────
export function CAIMeter({ value }) {
  const size = 130;
  const radius = (size - 16) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - ((value || 0) / 100) * circumference;
  const color = value >= 80 ? "#10b981" : value >= 60 ? "#fbbf24" : "#f87171";
  const statusText = value >= 80 ? "Well calibrated" : value >= 60 ? "Slightly off" : "Needs work";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth="8" fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: 500, color: "#ffffff", fontFamily: "monospace" }}>
          {value != null ? `${Math.round(value)}%` : "—"}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px" }}>Confidence accuracy</div>
        <div style={{ color, fontSize: "13px", fontWeight: 500 }}>{statusText}</div>
        <div style={{ color: "rgba(148,163,184,0.4)", fontSize: "11px", marginTop: "2px", lineHeight: "1.5" }}>How well your self-perception matches reality</div>
      </div>
    </div>
  );
}