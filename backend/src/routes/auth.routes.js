// auth.routes.js
const express = require("express");
const { body } = require("express-validator");
const { login, getMe } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = express.Router();

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
    validate,
  ],
  login
);

router.get("/me", authenticate, getMe);

module.exports = router;
