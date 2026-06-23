const prisma = require("../utils/prisma");
const { sendSuccess } = require("../utils/response");
const { calculateCAI } = require("../utils/scoring");

const getLeaderboard = async (req, res, next) => {
  try {
    const attempts = await prisma.testAttempt.findMany({
      where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
      include: {
        user: { select: { id: true, name: true, department: true } },
      },
      orderBy: { scorePercentage: "desc" },
    });

    const leaderboard = await Promise.all(
      attempts.map(async (a, idx) => {
        const self = await prisma.selfAssessment.findUnique({ where: { userId: a.userId } });
        const cai = self ? calculateCAI(self.overallPercentage, a.scorePercentage) : null;
        return {
          rank: idx + 1,
          userId: a.userId,
          name: a.user.name,
          department: a.user.department,
          actualScore: a.scorePercentage,
          cai,
        };
      })
    );

    sendSuccess(res, { leaderboard });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeaderboard };
