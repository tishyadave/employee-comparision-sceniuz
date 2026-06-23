const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");
const { ratingsToPercentage } = require("../utils/scoring");

const SKILL_FIELDS = [
  "htmlRating",
  "cssRating",
  "jsRating",
  "reactRating",
  "communicationRating",
  "problemSolvingRating",
];

const submitSelfAssessment = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // One attempt only
    const existing = await prisma.selfAssessment.findUnique({ where: { userId } });
    if (existing) return sendError(res, "Self-assessment already completed", 409);

    const {
      htmlRating,
      cssRating,
      jsRating,
      reactRating,
      communicationRating,
      problemSolvingRating,
    } = req.body;

    const ratings = [
      htmlRating,
      cssRating,
      jsRating,
      reactRating,
      communicationRating,
      problemSolvingRating,
    ];

    // All ratings must be 1–5
    if (ratings.some((r) => r < 1 || r > 5)) {
      return sendError(res, "All ratings must be between 1 and 5", 400);
    }

    const overallPercentage = ratingsToPercentage(ratings);

    const assessment = await prisma.selfAssessment.create({
      data: {
        userId,
        htmlRating,
        cssRating,
        jsRating,
        reactRating,
        communicationRating,
        problemSolvingRating,
        overallPercentage,
      },
    });

    sendSuccess(res, { assessment }, "Self-assessment submitted", 201);
  } catch (err) {
    next(err);
  }
};

const getMySelfAssessment = async (req, res, next) => {
  try {
    const assessment = await prisma.selfAssessment.findUnique({
      where: { userId: req.user.id },
    });
    sendSuccess(res, { assessment });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitSelfAssessment, getMySelfAssessment };
