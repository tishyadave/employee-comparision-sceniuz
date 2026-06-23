const express = require("express");
const { body } = require("express-validator");
const {
  getAllQuestions, getQuestionById, createQuestion,
  updateQuestion, deleteQuestion, getTopics,
} = require("../controllers/question.controller");
const { authenticate, requireRole } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = express.Router();

const questionValidators = [
  body("questionText").notEmpty().withMessage("Question text required"),
  body("optionA").notEmpty(), body("optionB").notEmpty(),
  body("optionC").notEmpty(), body("optionD").notEmpty(),
  body("correctAnswer").isIn(["A","B","C","D"]).withMessage("Correct answer must be A, B, C, or D"),
  body("topic").notEmpty().withMessage("Topic required"),
];

router.get("/topics", authenticate, getTopics);
router.get("/", authenticate, getAllQuestions);
router.get("/:id", authenticate, requireRole("ADMIN"), getQuestionById);
router.post("/", authenticate, requireRole("ADMIN"), questionValidators, validate, createQuestion);
router.put("/:id", authenticate, requireRole("ADMIN"), questionValidators, validate, updateQuestion);
router.delete("/:id", authenticate, requireRole("ADMIN"), deleteQuestion);

module.exports = router;
