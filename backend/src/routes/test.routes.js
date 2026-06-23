// ── test.routes.js ─────────────────────────────────────────────────────────────
const express = require("express");
const { startTest, submitTest, getMyResults } = require("../controllers/test.controller");
const { authenticate, requireRole } = require("../middleware/auth.middleware");

const testRouter = express.Router();
testRouter.post("/start", authenticate, requireRole("EMPLOYEE"), startTest);
testRouter.post("/submit", authenticate, requireRole("EMPLOYEE"), submitTest);
testRouter.get("/results", authenticate, requireRole("EMPLOYEE"), getMyResults);

module.exports = testRouter;
