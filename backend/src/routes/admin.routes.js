const express = require("express");
const { body } = require("express-validator");
const {
  getAllEmployees, getEmployeeById, createEmployee,
  updateEmployee, deleteEmployee,
} = require("../controllers/admin.controller");
const { authenticate, requireRole } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = express.Router();
router.use(authenticate, requireRole("ADMIN"));

router.get("/employees", getAllEmployees);
router.get("/employees/:id", getEmployeeById);
router.post(
  "/employees",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    validate,
  ],
  createEmployee
);
router.put("/employees/:id", updateEmployee);
router.delete("/employees/:id", deleteEmployee);

module.exports = router;
