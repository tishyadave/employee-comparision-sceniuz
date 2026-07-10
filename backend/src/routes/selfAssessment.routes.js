const express = require("express");
const { body } = require("express-validator");
const { submitSelfAssessment, getMySelfAssessment } = require("../controllers/selfAssessment.controller");
const { authenticate, requireRole } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = express.Router();

const ratingValidators = [
  body("ratings").isArray({ min: 1 }).withMessage("ratings must be a non-empty array"),
  body("ratings.*.topicId").isString().notEmpty().withMessage("topicId is required"),
  body("ratings.*.subtopicId").isString().notEmpty().withMessage("subtopicId is required"),
  body("ratings.*.rating").isInt({ min: 1, max: 5 }).withMessage("rating must be an integer between 1 and 5"),
];

router.post("/", authenticate, requireRole("EMPLOYEE"), ratingValidators, validate, submitSelfAssessment);
router.get("/me", authenticate, requireRole("EMPLOYEE"), getMySelfAssessment);

module.exports = router;
