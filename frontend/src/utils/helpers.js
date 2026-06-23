export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const formatPercent = (val, decimals = 1) =>
  val != null ? `${Number(val).toFixed(decimals)}%` : "—";

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const formatDuration = (seconds) => {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

export const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

export const getGapColor = (gap) => {
  if (gap > 10) return "text-amber-600 bg-amber-50";
  if (gap < -10) return "text-blue-600 bg-blue-50";
  return "text-emerald-600 bg-emerald-50";
};

export const getGapLabel = (gap) => {
  if (gap > 10) return "Overconfident";
  if (gap < -10) return "Underconfident";
  return "Well calibrated";
};

export const getScoreColor = (score) => {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-500";
};

export const getCAIColor = (cai) => {
  if (cai >= 80) return "text-emerald-600";
  if (cai >= 60) return "text-amber-600";
  return "text-red-500";
};

export const SKILL_LABELS = {
  htmlRating: "HTML",
  cssRating: "CSS",
  jsRating: "JavaScript",
  reactRating: "React",
  communicationRating: "Communication",
  problemSolvingRating: "Problem Solving",
};

export const RATING_LABELS = {
  1: "Beginner",
  2: "Basic",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};
