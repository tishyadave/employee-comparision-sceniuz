const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const SALT_ROUNDS = 10;

// ── Employee Management ────────────────────────────────────────────────────────

const getAllEmployees = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // SUPER_ADMIN sees all employees; ADMIN sees only their own team
    const teamFilter =
      req.user.role === "ADMIN"
        ? { OR: [{ teamLead: req.user.id }, { teamLead: req.user.name }] }
        : {};

    const where = {
      role: "EMPLOYEE",
      ...teamFilter,
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { department: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const [employees, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          teamLead: true,
          createdAt: true,
          selfAssessment: { select: { overallPercentage: true } },
          testAttempts: {
            where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
            select: { scorePercentage: true, submittedAt: true },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    sendSuccess(res, { employees, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, department: true, teamLead: true, role: true, createdAt: true,
        selfAssessment: true,
        testAttempts: {
          where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
          include: { responses: { include: { question: true } } },
          take: 1,
        },
      },
    });
    if (!employee || employee.role !== "EMPLOYEE") return sendError(res, "Employee not found", 404);

    // ADMIN can only view their own team members
    if (req.user.role === "ADMIN" && employee.teamLead !== req.user.id && employee.teamLead !== req.user.name) {
      return sendError(res, "Access denied", 403);
    }

    sendSuccess(res, { employee });
  } catch (err) {
    next(err);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, department, teamLead } = req.body;
    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (exists) return sendError(res, "Email already in use", 409);

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const employee = await prisma.user.create({
      data: { name, email: email.toLowerCase().trim(), passwordHash, department, teamLead, role: "EMPLOYEE" },
      select: { id: true, name: true, email: true, department: true, teamLead: true, createdAt: true },
    });
    sendSuccess(res, { employee }, "Employee created", 201);
  } catch (err) {
    next(err);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, department, password, teamLead } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== "EMPLOYEE") return sendError(res, "Employee not found", 404);

    // ADMIN can only update their own team members
    if (req.user.role === "ADMIN" && existing.teamLead !== req.user.id && existing.teamLead !== req.user.name) {
      return sendError(res, "Access denied", 403);
    }

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email.toLowerCase().trim();
    if (department) data.department = department;
    if (password) data.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    if (teamLead !== undefined) data.teamLead = teamLead;

    const employee = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, department: true, teamLead: true },
    });
    sendSuccess(res, { employee }, "Employee updated");
  } catch (err) {
    next(err);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== "EMPLOYEE") return sendError(res, "Employee not found", 404);

    // ADMIN can only delete their own team members
    if (req.user.role === "ADMIN" && existing.teamLead !== req.user.id && existing.teamLead !== req.user.name) {
      return sendError(res, "Access denied", 403);
    }

    await prisma.user.delete({ where: { id } });
    sendSuccess(res, {}, "Employee deleted");
  } catch (err) {
    next(err);
  }
};

// ── Admin / Super Admin Management (SUPER_ADMIN only) ─────────────────────────

const getAllAdmins = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      role: { in: ["ADMIN", "SUPER_ADMIN"] },
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { department: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const [admins, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          role: true,
          createdAt: true,
        },
        orderBy: [{ role: "asc" }, { createdAt: "desc" }],
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    sendSuccess(res, { admins, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, department, role } = req.body;

    // Only allow creating ADMIN or SUPER_ADMIN
    const allowedRoles = ["ADMIN", "SUPER_ADMIN"];
    const targetRole = allowedRoles.includes(role) ? role : "ADMIN";

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (exists) return sendError(res, "Email already in use", 409);

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const admin = await prisma.user.create({
      data: { name, email: email.toLowerCase().trim(), passwordHash, department, role: targetRole },
      select: { id: true, name: true, email: true, department: true, role: true, createdAt: true },
    });
    sendSuccess(res, { admin }, "Admin created", 201);
  } catch (err) {
    next(err);
  }
};

const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, department, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || !["ADMIN", "SUPER_ADMIN"].includes(existing.role)) {
      return sendError(res, "Admin not found", 404);
    }

    // Prevent the super admin from demoting themselves
    if (existing.id === req.user.id && role && role !== "SUPER_ADMIN") {
      return sendError(res, "You cannot change your own role", 400);
    }

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email.toLowerCase().trim();
    if (department !== undefined) data.department = department;
    if (password) data.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    if (role && ["ADMIN", "SUPER_ADMIN"].includes(role)) data.role = role;

    const admin = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, department: true, role: true },
    });
    sendSuccess(res, { admin }, "Admin updated");
  } catch (err) {
    next(err);
  }
};

const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user.id) return sendError(res, "You cannot delete your own account", 400);

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || !["ADMIN", "SUPER_ADMIN"].includes(existing.role)) {
      return sendError(res, "Admin not found", 404);
    }

    await prisma.user.delete({ where: { id } });
    sendSuccess(res, {}, "Admin deleted");
  } catch (err) {
    next(err);
  }
};

// ── Helpers ────────────────────────────────────────────────────────────────────

// Returns a list of all admins (id + name) for the "assign team lead" dropdown
const getAdminsList = async (req, res, next) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });
    sendSuccess(res, { admins });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminsList,
};
