const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getAllQuestions = async (req, res, next) => {
  try {
    const { topic } = req.query;
    const where = topic ? { topic } : {};
    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });
    sendSuccess(res, { questions, count: questions.length });
  } catch (err) {
    next(err);
  }
};

const getQuestionById = async (req, res, next) => {
  try {
    const question = await prisma.question.findUnique({ where: { id: req.params.id } });
    if (!question) return sendError(res, "Question not found", 404);
    sendSuccess(res, { question });
  } catch (err) {
    next(err);
  }
};

const createQuestion = async (req, res, next) => {
  try {
    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, topic } = req.body;
    const question = await prisma.question.create({
      data: { questionText, optionA, optionB, optionC, optionD, correctAnswer, topic },
    });
    sendSuccess(res, { question }, "Question created", 201);
  } catch (err) {
    next(err);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) return sendError(res, "Question not found", 404);

    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, topic } = req.body;
    const question = await prisma.question.update({
      where: { id },
      data: { questionText, optionA, optionB, optionC, optionD, correctAnswer, topic },
    });
    sendSuccess(res, { question }, "Question updated");
  } catch (err) {
    next(err);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) return sendError(res, "Question not found", 404);
    await prisma.question.delete({ where: { id } });
    sendSuccess(res, {}, "Question deleted");
  } catch (err) {
    next(err);
  }
};

const getTopics = async (req, res, next) => {
  try {
    const topics = await prisma.question.findMany({
      select: { topic: true },
      distinct: ["topic"],
    });
    sendSuccess(res, { topics: topics.map((t) => t.topic) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getTopics,
};
