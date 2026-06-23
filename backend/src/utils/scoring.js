/**
 * Confidence Accuracy Index
 * CAI = 100 - |selfScore - actualScore|
 * Range: 0–100. Higher = better calibration.
 */
const calculateCAI = (selfPercentage, actualPercentage) => {
  const diff = Math.abs(selfPercentage - actualPercentage);
  return Math.max(0, 100 - diff);
};

/**
 * Convert skill ratings (1–5 scale) to a percentage (0–100)
 * Formula: ((sum of ratings) / (maxRating * numSkills)) * 100
 */
const ratingsToPercentage = (ratings) => {
  const MAX_RATING = 5;
  const total = ratings.reduce((acc, r) => acc + r, 0);
  return parseFloat(((total / (MAX_RATING * ratings.length)) * 100).toFixed(2));
};

/**
 * Determine gap direction for a single employee
 * Positive gap → overconfidence
 * Negative gap → underconfidence
 */
const getGapLabel = (gap) => {
  if (gap > 10) return "Overconfident";
  if (gap < -10) return "Underconfident";
  return "Well calibrated";
};

module.exports = { calculateCAI, ratingsToPercentage, getGapLabel };
