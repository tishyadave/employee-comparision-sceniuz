const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");
const { calculateCAI } = require("../utils/scoring");

const TEST_DURATION_SECONDS = 60 * 60; // 30 minutes

// ── Start test ─────────────────────────────────────────────────────────────────
const startTest = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Ensure self-assessment is completed first
    const selfAssessment = await prisma.selfAssessment.findUnique({
      where: { userId },
    });
    if (!selfAssessment) {
      return sendError(res, "Please complete your self-assessment first.", 403);
    }

    // One attempt only
    const existing = await prisma.testAttempt.findFirst({
      where: { userId, status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
    });
    if (existing) return sendError(res, "Test already completed", 409);

    // Check for in-progress attempt
    const inProgress = await prisma.testAttempt.findFirst({
      where: { userId, status: "IN_PROGRESS" },
    });
    if (inProgress) {
      // Return questions for resumed attempt
      const questions = await prisma.question.findMany({
        select: {
          id: true,
          questionText: true,
          optionA: true,
          optionB: true,
          optionC: true,
          optionD: true,
          topic: true,
        },
      });
      const elapsed = Math.floor((Date.now() - new Date(inProgress.startedAt).getTime()) / 1000);
      const remaining = Math.max(0, TEST_DURATION_SECONDS - elapsed);
      return sendSuccess(res, { attempt: inProgress, questions, remainingSeconds: remaining });
    }

    const questions = await prisma.question.findMany({
      select: {
        id: true,
        questionText: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        topic: true,
      },
    });

    const attempt = await prisma.testAttempt.create({
      data: {
        userId,
        totalQuestions: questions.length,
        status: "IN_PROGRESS",
      },
    });

    sendSuccess(
      res,
      { attempt, questions, remainingSeconds: TEST_DURATION_SECONDS },
      "Test started",
      201
    );
  } catch (err) {
    next(err);
  }
};

// ── Submit test ────────────────────────────────────────────────────────────────
const submitTest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { attemptId, answers, autoSubmit = false } = req.body;
    // answers = [{ questionId, selectedAnswer }]

    const attempt = await prisma.testAttempt.findFirst({
      where: { id: attemptId, userId, status: "IN_PROGRESS" },
    });
    if (!attempt) return sendError(res, "No active test attempt found", 404);

    // Fetch all questions to validate answers
    const questions = await prisma.question.findMany();
    const questionMap = Object.fromEntries(questions.map((q) => [q.id, q]));

    let correct = 0;
    const responseData = answers.map(({ questionId, selectedAnswer }) => {
      const question = questionMap[questionId];
      const isCorrect = question ? question.correctAnswer === selectedAnswer : false;
      if (isCorrect) correct++;
      return {
        attemptId,
        questionId,
        selectedAnswer: selectedAnswer || null,
        isCorrect,
      };
    });

    const timeTaken = Math.floor(
      (Date.now() - new Date(attempt.startedAt).getTime()) / 1000
    );
    const scorePercentage = parseFloat(
      ((correct / attempt.totalQuestions) * 100).toFixed(2)
    );

    // Bulk delete and bulk insert in a transaction to minimize DB round-trips (prevents frontend timeout)
    await prisma.$transaction([
      prisma.response.deleteMany({
        where: { attemptId },
      }),
      prisma.response.createMany({
        data: responseData,
      }),
      prisma.testAttempt.update({
        where: { id: attemptId },
        data: {
          submittedAt: new Date(),
          timeTakenSeconds: timeTaken,
          scorePercentage,
          correctAnswers: correct,
          status: autoSubmit ? "AUTO_SUBMITTED" : "SUBMITTED",
        },
      }),
    ]);

    sendSuccess(res, {
      scorePercentage,
      correctAnswers: correct,
      totalQuestions: attempt.totalQuestions,
    });
  } catch (err) {
    next(err);
  }
};

// ── Get my results ─────────────────────────────────────────────────────────────
const getMyResults = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const attempt = await prisma.testAttempt.findFirst({
      where: { userId, status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
      include: {
        responses: {
          include: {
            question: { select: { topic: true, questionText: true, correctAnswer: true } },
          },
        },
      },
    });

    const selfAssessment = await prisma.selfAssessment.findUnique({
      where: { userId },
      include: { ratings: true },
    });

    if (!attempt) return sendError(res, "No completed test found", 404);

    // Build topic-wise breakdown
    const topicMap = {};
    for (const r of attempt.responses) {
      const topic = r.question.topic;
      if (!topicMap[topic]) topicMap[topic] = { correct: 0, total: 0 };
      topicMap[topic].total++;
      if (r.isCorrect) topicMap[topic].correct++;
    }
    const topicBreakdown = Object.entries(topicMap).map(([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      percentage: parseFloat(((correct / total) * 100).toFixed(1)),
    }));

    // Calculate average rating per topicId (1-5 mapped to 0-100)
    const topicRatings = {};
    if (selfAssessment && selfAssessment.ratings) {
      const topicSums = {};
      const topicCounts = {};
      for (const r of selfAssessment.ratings) {
        if (!topicSums[r.topicId]) {
          topicSums[r.topicId] = 0;
          topicCounts[r.topicId] = 0;
        }
        topicSums[r.topicId] += r.rating;
        topicCounts[r.topicId]++;
      }
      for (const topicId of Object.keys(topicSums)) {
        const avg = topicSums[topicId] / topicCounts[topicId];
        topicRatings[topicId] = ((avg - 1) / 4) * 100;
      }
    }

    const topicNameToId = {
      "DAX - Intermediate": "dax_intermediate",
      "Advanced Concepts (Optimization)": "dax_advanced",
      "Microsoft Fabric": "microsoft_fabric",
      "Power BI Embedded": "power_bi_embedded",
      "Log Analytics & Monitoring": "log_analytics",
      "Administration": "administration",
      "Dax Basics": "dax_basic",
      "Power BI Fundamentals": "power_bi_fundamentals",
      "Data Source & Connectivity": "data_source_connectivity",
      "Data Transformation": "data_transformation",
      "Data Modeling": "data_modeling",
      "Visualization & Report Design": "visualization_design",
      "Security & Governance": "security_governance",
      "Power BI Service": "power_bi_service",
    };

    const getSelfRatingForTopic = (topicName) => {
      const topicId = topicNameToId[topicName] || topicName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      return topicRatings[topicId] !== undefined ? topicRatings[topicId] : null;
    };

    // Skill-wise self vs actual (map topic names to self ratings)
    const skillMapping = {};
    for (const t of topicBreakdown) {
      skillMapping[t.topic] = getSelfRatingForTopic(t.topic);
    }

    const cai = selfAssessment
      ? calculateCAI(selfAssessment.overallPercentage, attempt.scorePercentage)
      : null;

    sendSuccess(res, {
      attempt: {
        id: attempt.id,
        scorePercentage: attempt.scorePercentage,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        timeTakenSeconds: attempt.timeTakenSeconds,
        submittedAt: attempt.submittedAt,
        status: attempt.status,
      },
      selfAssessment: selfAssessment
        ? { overallPercentage: selfAssessment.overallPercentage }
        : null,
      cai,
      topicBreakdown,
      skillMapping,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { startTest, submitTest, getMyResults };
