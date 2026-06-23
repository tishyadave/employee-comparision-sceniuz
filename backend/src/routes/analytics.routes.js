const express = require("express");
const {
  getOverviewStats, getSelfVsActual, getGapAnalysis,
  getQuestionDifficulty, getTopPerformers, exportCSV,
} = require("../controllers/analytics.controller");
const { authenticate, requireRole } = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authenticate, requireRole("ADMIN"));

router.get("/overview", getOverviewStats);
router.get("/self-vs-actual", getSelfVsActual);
router.get("/gap-analysis", getGapAnalysis);
router.get("/question-difficulty", getQuestionDifficulty);
router.get("/top-performers", getTopPerformers);
router.get("/export-csv", exportCSV);

module.exports = router;
