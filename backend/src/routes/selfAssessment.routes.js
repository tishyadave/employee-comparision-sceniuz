const express = require("express");
const { body } = require("express-validator");
const { submitSelfAssessment, getMySelfAssessment } = require("../controllers/selfAssessment.controller");
const { authenticate, requireRole } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = express.Router();

const ratingValidators = ["htmlRating", "cssRating", "jsRating", "reactRating", "communicationRating", "problemSolvingRating"].map(
  (field) => body(field).isInt({ min: 1, max: 5 }).withMessage(`${field} must be 1–5`)
);

router.post("/", authenticate, requireRole("EMPLOYEE"), ratingValidators, validate, submitSelfAssessment);
router.get("/me", authenticate, requireRole("EMPLOYEE"), getMySelfAssessment);

module.exports = router;
