const prisma = require("../utils/prisma");
const { sendSuccess } = require("../utils/response");
const { calculateCAI } = require("../utils/scoring");

// ── Overview stats ─────────────────────────────────────────────────────────────
const getOverviewStats = async (req, res, next) => {
  try {
    const [totalEmployees, selfCount, testCount, selfAgg, testAgg] = await Promise.all([
      prisma.user.count({ where: { role: "EMPLOYEE" } }),
      prisma.selfAssessment.count(),
      prisma.testAttempt.count({ where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } } }),
      prisma.selfAssessment.aggregate({ _avg: { overallPercentage: true } }),
      prisma.testAttempt.aggregate({
        _avg: { scorePercentage: true },
        where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
      }),
    ]);

    const avgSelf = parseFloat((selfAgg._avg.overallPercentage || 0).toFixed(1));
    const avgActual = parseFloat((testAgg._avg.scorePercentage || 0).toFixed(1));
    const avgCAI = parseFloat(Math.max(0, 100 - Math.abs(avgSelf - avgActual)).toFixed(1));

    sendSuccess(res, {
      totalEmployees,
      selfAssessmentsCompleted: selfCount,
      testsCompleted: testCount,
      avgSelfScore: avgSelf,
      avgActualScore: avgActual,
      avgAccuracyIndex: avgCAI,
    });
  } catch (err) {
    next(err);
  }
};

// ── Self vs Actual per employee ────────────────────────────────────────────────
const getSelfVsActual = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      select: {
        id: true,
        name: true,
        selfAssessment: { select: { overallPercentage: true } },
        testAttempts: {
          where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
          select: { scorePercentage: true },
          take: 1,
        },
      },
    });

    const data = users
      .filter((u) => u.selfAssessment || u.testAttempts.length > 0)
      .map((u) => ({
        name: u.name,
        selfScore: u.selfAssessment?.overallPercentage ?? null,
        actualScore: u.testAttempts[0]?.scorePercentage ?? null,
      }));

    sendSuccess(res, { data });
  } catch (err) {
    next(err);
  }
};

// ── Gap analysis ───────────────────────────────────────────────────────────────
const getGapAnalysis = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      select: {
        name: true,
        selfAssessment: { select: { overallPercentage: true } },
        testAttempts: {
          where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
          select: { scorePercentage: true },
          take: 1,
        },
      },
    });

    const data = users
      .filter((u) => u.selfAssessment && u.testAttempts.length > 0)
      .map((u) => {
        const gap = parseFloat(
          (u.selfAssessment.overallPercentage - u.testAttempts[0].scorePercentage).toFixed(1)
        );
        return {
          name: u.name,
          gap,
          label: gap > 10 ? "Overconfident" : gap < -10 ? "Underconfident" : "Calibrated",
        };
      });

    sendSuccess(res, { data });
  } catch (err) {
    next(err);
  }
};

// ── Question difficulty ────────────────────────────────────────────────────────
const getQuestionDifficulty = async (req, res, next) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        responses: { select: { isCorrect: true } },
      },
    });

    const data = questions.map((q) => {
      const total = q.responses.length;
      const correct = q.responses.filter((r) => r.isCorrect).length;
      const pct = total > 0 ? parseFloat(((correct / total) * 100).toFixed(1)) : 0;
      return {
        id: q.id,
        question: q.questionText.slice(0, 60) + (q.questionText.length > 60 ? "..." : ""),
        topic: q.topic,
        correctPercentage: pct,
        totalAttempts: total,
      };
    });

    // Sort hardest first
    data.sort((a, b) => a.correctPercentage - b.correctPercentage);
    sendSuccess(res, { data });
  } catch (err) {
    next(err);
  }
};

// ── Top performers ─────────────────────────────────────────────────────────────
const getTopPerformers = async (req, res, next) => {
  try {
    const attempts = await prisma.testAttempt.findMany({
      where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
      include: {
        user: { select: { name: true, email: true, department: true } },
      },
      orderBy: { scorePercentage: "desc" },
      take: 10,
    });

    const data = await Promise.all(
      attempts.map(async (a, idx) => {
        const self = await prisma.selfAssessment.findUnique({ where: { userId: a.userId } });
        const cai = self ? calculateCAI(self.overallPercentage, a.scorePercentage) : null;
        return {
          rank: idx + 1,
          name: a.user.name,
          email: a.user.email,
          department: a.user.department,
          actualScore: a.scorePercentage,
          selfScore: self?.overallPercentage ?? null,
          cai,
        };
      })
    );

    sendSuccess(res, { data });
  } catch (err) {
    next(err);
  }
};

// ── CSV export ─────────────────────────────────────────────────────────────────
const exportCSV = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      select: {
        name: true,
        email: true,
        department: true,
        selfAssessment: { select: { overallPercentage: true } },
        testAttempts: {
          where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
          select: { scorePercentage: true },
          take: 1,
        },
      },
    });

    const rows = [["Name", "Email", "Department", "Self Score", "Actual Score", "Gap", "CAI"]];

    for (const u of users) {
      const selfScore = u.selfAssessment?.overallPercentage ?? "";
      const actualScore = u.testAttempts[0]?.scorePercentage ?? "";
      const gap =
        selfScore !== "" && actualScore !== ""
          ? parseFloat((selfScore - actualScore).toFixed(1))
          : "";
      const cai =
        selfScore !== "" && actualScore !== ""
          ? parseFloat(Math.max(0, 100 - Math.abs(selfScore - actualScore)).toFixed(1))
          : "";
      rows.push([u.name, u.email, u.department || "", selfScore, actualScore, gap, cai]);
    }

    const csv = rows.map((r) => r.join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=skill_assessment_results.csv");
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOverviewStats,
  getSelfVsActual,
  getGapAnalysis,
  getQuestionDifficulty,
  getTopPerformers,
  exportCSV,
};
