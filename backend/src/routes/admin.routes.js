const express = require("express");
const { body } = require("express-validator");
const {
  getAllEmployees, getEmployeeById, createEmployee,
  updateEmployee, deleteEmployee,
  getAllAdmins, createAdmin, updateAdmin, deleteAdmin,
  getAdminsList,
} = require("../controllers/admin.controller");
const { authenticate, requireRole, requireSuperAdmin } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = express.Router();

// All admin routes require authentication first
router.use(authenticate);

// ── Employee routes — accessible by ADMIN and SUPER_ADMIN ──────────────────────
router.get("/employees", requireRole("ADMIN"), getAllEmployees);
router.get("/employees/:id", requireRole("ADMIN"), getEmployeeById);
router.post(
  "/employees",
  requireRole("ADMIN"),
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    validate,
  ],
  createEmployee
);
router.put("/employees/:id", requireRole("ADMIN"), updateEmployee);
router.delete("/employees/:id", requireRole("ADMIN"), deleteEmployee);

// ── Helper — list of admins for team-lead assignment dropdown ─────────────────
// Accessible by ADMIN and SUPER_ADMIN (used when creating/editing employees)
router.get("/admins-list", requireRole("ADMIN"), getAdminsList);

// ── Admin management routes — SUPER_ADMIN only ────────────────────────────────
router.get("/admins", requireSuperAdmin, getAllAdmins);
router.post(
  "/admins",
  requireSuperAdmin,
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    validate,
  ],
  createAdmin
);
router.put("/admins/:id", requireSuperAdmin, updateAdmin);
router.delete("/admins/:id", requireSuperAdmin, deleteAdmin);

module.exports = router;
