import React, { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { userService } from "@/services";
import { ScoreRing, CAIMeter, Spinner, Alert } from "@/components/ui";
import { formatPercent } from "@/utils/helpers";
import { Brain, ClipboardCheck, Trophy, ArrowRight, CheckCircle, Clock, Lock } from "lucide-react";
import BorderGlow from "@/component/BorderGlow/BorderGlow";

const FloatingLines = lazy(() => import("@/component/FloatingLines/FloatingLines"));

function caiColor(v) {
    if (v == null) return "#fbbf24";
    return v >= 80 ? "#10b981" : v >= 60 ? "#fbbf24" : "#f87171";
}
function caiBorder(v) {
    if (v == null) return "rgba(251,191,36,0.2)";
    return v >= 80 ? "rgba(16,185,129,0.2)" : v >= 60 ? "rgba(251,191,36,0.2)" : "rgba(248,113,113,0.2)";
}
function getGlowProps(color) {
    if (color === "#c084fc") return { colors: ['#c084fc', '#a855f7', '#8b5cf6'], glowColor: "274 95 75" };
    if (color === "#10b981") return { colors: ['#10b981', '#059669', '#34d399'], glowColor: "159 84 39" };
    if (color === "#fbbf24") return { colors: ['#fbbf24', '#f59e0b', '#d97706'], glowColor: "43 96 56" };
    if (color === "#f87171") return { colors: ['#f87171', '#ef4444', '#dc2626'], glowColor: "0 91 71" };
    if (color === "#60a5fa") return { colors: ['#60a5fa', '#3b82f6', '#2563eb'], glowColor: "213 93 68" };
    return { colors: ['#c084fc', '#f472b6', '#38bdf8'], glowColor: "274 95 75" };
}

function StatCard({ label, value, sub, color }) {
    const glow = getGlowProps(color || caiColor(value));
    return (
        <BorderGlow
            edgeSensitivity={30}
            glowColor={glow.glowColor}
            backgroundColor="rgba(15,20,32,0.9)"
            borderRadius={14}
            glowRadius={30}
            glowIntensity={0.8}
            coneSpread={25}
            animated={false}
            colors={glow.colors}
        >
            <div style={{ padding: "20px 18px", width: "100%", boxSizing: "border-box" }}>
                <div style={{ fontSize: "10px", color: "#ffffff", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
                    {label}
                </div>
                <div style={{ fontSize: "28px", fontWeight: 500, color: color || caiColor(value), fontFamily: "monospace" }}>{value}</div>
                <div style={{ fontSize: "11px", color: "#ffffff", marginTop: "6px" }}>{sub}</div>
            </div>
        </BorderGlow>
    );
}

function StatusBadge({ done }) {
    return (
        <span style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "3px 10px", borderRadius: "20px", fontSize: "10px",
            background: done ? "rgba(16,185,129,0.1)" : "rgba(251,191,36,0.1)",
            border: done ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(251,191,36,0.25)",
            color: done ? "#34d399" : "#fbbf24",
        }}>
            {done ? <CheckCircle size={11} /> : <Clock size={11} />}
            {done ? "Completed" : "Pending"}
        </span>
    );
}

function StepCard({ icon: Icon, title, description, to, done, disabled, accentColor = "#a855f7", accentBg = "rgba(168,85,247,0.12)", accentBorder = "rgba(168,85,247,0.2)", unlockMsg }) {
    const active = !done && !disabled;
    return (
        <Link
            to={active ? to : "#"}
            onClick={(e) => !active && e.preventDefault()}
            style={{
                display: "flex", alignItems: "flex-start", gap: "16px",
                padding: "20px", borderRadius: "14px", textDecoration: "none",
                background: disabled ? "rgba(15,20,32,0.5)" : "rgba(15,20,32,0.9)",
                border: done
                    ? "1px solid rgba(16,185,129,0.25)"
                    : disabled
                        ? "1px solid rgba(168,85,247,0.08)"
                        : "1px solid rgba(168,85,247,0.35)",
                opacity: disabled ? 0.45 : 1,
                cursor: active ? "pointer" : "default",
                position: "relative", overflow: "hidden",
                transition: "border-color 0.2s",
            }}
        >
            <div style={{
                position: "absolute", top: 0, left: 0, width: "3px", height: "100%",
                background: done ? "#10b981" : disabled ? "rgba(168,85,247,0.15)" : accentColor,
                borderRadius: "14px 0 0 14px",
            }} />
            <div style={{
                padding: "11px", borderRadius: "12px", flexShrink: 0,
                background: done ? "rgba(16,185,129,0.1)" : accentBg,
                color: done ? "#10b981" : disabled ? `${accentColor}66` : accentColor,
                border: `1px solid ${done ? "rgba(16,185,129,0.2)" : accentBorder}`,
            }}>
                <Icon size={20} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "15px", color: disabled ? "rgba(255,255,255,0.5)" : "#ffffff", fontWeight: 500 }}>{title}</span>
                        {disabled && unlockMsg && (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "rgba(148,163,184,0.4)" }}>
                                <Lock size={10} />{unlockMsg}
                            </span>
                        )}
                    </div>
                    {!disabled && <StatusBadge done={done} />}
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: disabled ? "rgba(148,163,184,0.4)" : "rgba(148,163,184,0.65)", lineHeight: "1.6" }}>
                    {description}
                </p>
            </div>
            {active && <ArrowRight size={16} color="rgba(255,255,255,0.35)" style={{ marginTop: "3px", flexShrink: 0 }} />}
        </Link>
    );
}

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const { data, loading, error } = useApi(() => userService.getDashboard());

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "100px" }}>
            <Spinner size="lg" />
        </div>
    );

    const d = data || {};
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const allDone = d.selfAssessmentCompleted && d.testCompleted;
    const completed = [d.selfAssessmentCompleted, d.testCompleted].filter(Boolean).length;

    return (
        <div style={{ position: "relative", minHeight: "100vh", padding: "32px", display: "flex", flexDirection: "column", gap: "28px" }}>
            <div style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", backgroundColor: "#070B14" }}>
                <Suspense fallback={null}>
                    <FloatingLines
                        enabledWaves={['top', 'middle', 'bottom']}
                        lineCount={[5, 8, 10]}
                        lineDistance={[8, 6, 4]}
                        bendRadius={5.0}
                        bendStrength={-0.5}
                        interactive={true}
                        parallax={false}
                    />
                </Suspense>
            </div>

            {/* Welcome */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "6px", padding: "12px 0 4px" }}>
                <p style={{ fontSize: "13px", color: "#c084fc", margin: 0, letterSpacing: "0.3px" }}>{greeting},</p>
                <h1 style={{ fontSize: "34px", color: "#ffffff", margin: 0, fontWeight: 500, letterSpacing: "-0.5px" }}>{user?.name}</h1>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "6px", marginBottom: 0, maxWidth: "420px", lineHeight: "1.6" }}>
                    {allDone
                        ? "You've completed all assessments. Check your results below."
                        : "Complete your self-assessment and MCQ test to see your results."}
                </p>
            </div>

            {error && <Alert type="error" message={error} />}

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                <StatCard label="Self Assessment Score" value={d.selfScore != null ? formatPercent(d.selfScore) : "—"} sub="Perceived Score" color="#c084fc" />
                <StatCard label="Test Score" value={d.actualScore != null ? formatPercent(d.actualScore) : "—"} sub="MCQ test result" color="#10b981" />
                <StatCard label="Accuracy Index" value={d.cai != null ? formatPercent(d.cai) : "—"} sub="Accuracy Score" color={caiColor(d.cai)} />
                <StatCard label="Status" value={d.testCompleted ? "All done" : `${completed} / 2`} sub="Assessments completed" color="#60a5fa" />
            </div>

            {/* Score rings */}
            {(d.selfScore != null || d.actualScore != null) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                    <BorderGlow
                        edgeSensitivity={30}
                        glowColor="274 95 75"
                        backgroundColor="rgba(15,20,32,0.9)"
                        borderRadius={14}
                        glowRadius={30}
                        glowIntensity={0.8}
                        coneSpread={25}
                        colors={['#c084fc', '#a855f7', '#8b5cf6']}
                        animated={false}
                        className="w-full"
                    >
                        <div style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", boxSizing: "border-box" }}>
                            <ScoreRing value={d.selfScore ?? 0} label="Self assessment" size={130} color="#a855f7" />
                        </div>
                    </BorderGlow>

                    <BorderGlow
                        edgeSensitivity={30}
                        glowColor="159 84 39"
                        backgroundColor="rgba(15,20,32,0.9)"
                        borderRadius={14}
                        glowRadius={30}
                        glowIntensity={0.8}
                        coneSpread={25}
                        colors={['#10b981', '#059669', '#34d399']}
                        animated={false}
                        className="w-full"
                    >
                        <div style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", boxSizing: "border-box" }}>
                            <ScoreRing value={d.actualScore ?? 0} label="MCQ Test Score" size={130} color="#10b981" />
                        </div>
                    </BorderGlow>

                    <BorderGlow
                        edgeSensitivity={30}
                        glowColor={getGlowProps(caiColor(d.cai)).glowColor}
                        backgroundColor="rgba(15,20,32,0.9)"
                        borderRadius={14}
                        glowRadius={30}
                        glowIntensity={0.8}
                        coneSpread={25}
                        colors={getGlowProps(caiColor(d.cai)).colors}
                        animated={false}
                        className="w-full"
                    >
                        <div style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", boxSizing: "border-box" }}>
                            <CAIMeter value={d.cai} />
                        </div>
                    </BorderGlow>
                </div>
            )}

            {/* Journey steps */}
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "11px", color: "#ffffff", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px" }}>Your journey</span>
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.12)" }} />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{completed} of 3 complete</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <StepCard
                        icon={Brain}
                        title="Self assessment"
                        description="Rate yourself on Power BI key skills: Fundamentals, Transformations, DAX , Reporting & Visualizations , Fabric and more...."
                        to="/self-assessment"
                        done={d.selfAssessmentCompleted}
                    />
                    <StepCard
                        icon={ClipboardCheck}
                        title="MCQ test"
                        description="Take the 50-question timed test to measure your actual knowledge"
                        to="/test"
                        done={d.testCompleted}
                        disabled={!d.selfAssessmentCompleted}
                        unlockMsg="Unlocks after step 1"
                    />
                    <StepCard
                        icon={Trophy}
                        title="Results & leaderboard"
                        description="See your scores, confidence accuracy index, and where you rank"
                        to="/results"
                        done={d.selfAssessmentCompleted && d.testCompleted}
                        disabled={!(d.selfAssessmentCompleted && d.testCompleted)}
                        accentColor="#fbbf24"
                        accentBg="rgba(251,191,36,0.08)"
                        accentBorder="rgba(251,191,36,0.2)"
                        unlockMsg="Unlocks after step 2"
                    />
                </div>
            </div>

            <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
}