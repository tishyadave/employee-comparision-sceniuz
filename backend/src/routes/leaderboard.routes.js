const express = require("express");
const { getLeaderboard } = require("../controllers/leaderboard.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();
router.get("/", authenticate, getLeaderboard);

module.exports = router;
