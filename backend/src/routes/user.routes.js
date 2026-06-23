const express = require("express");
const prisma = require("../utils/prisma");
const { authenticate } = require("../middleware/auth.middleware");
const { sendSuccess } = require("../utils/response");
const { calculateCAI } = require("../utils/scoring");

const router = express.Router();

// Employee dashboard summary
router.get("/dashboard", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [selfAssessment, testAttempt] = await Promise.all([
      prisma.selfAssessment.findUnique({ where: { userId } }),
      prisma.testAttempt.findFirst({
        where: { userId, status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
        orderBy: { submittedAt: "desc" },
      }),
    ]);

    const cai =
      selfAssessment && testAttempt
        ? calculateCAI(selfAssessment.overallPercentage, testAttempt.scorePercentage)
        : null;

    sendSuccess(res, {
      user: req.user,
      selfAssessmentCompleted: !!selfAssessment,
      testCompleted: !!testAttempt,
      selfScore: selfAssessment?.overallPercentage ?? null,
      actualScore: testAttempt?.scorePercentage ?? null,
      cai,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
