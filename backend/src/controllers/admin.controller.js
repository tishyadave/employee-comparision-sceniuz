const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const SALT_ROUNDS = 10;

const getAllEmployees = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      role: "EMPLOYEE",
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
          createdAt: true,
          selfAssessment: { select: { overallPercentage: true, completedAt: true } },
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
        id: true, name: true, email: true, department: true, createdAt: true,
        selfAssessment: true,
        testAttempts: {
          where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
          include: { responses: { include: { question: true } } },
          take: 1,
        },
      },
    });
    if (!employee || employee.role === "ADMIN") return sendError(res, "Employee not found", 404);
    sendSuccess(res, { employee });
  } catch (err) {
    next(err);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;
    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (exists) return sendError(res, "Email already in use", 409);

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const employee = await prisma.user.create({
      data: { name, email: email.toLowerCase().trim(), passwordHash, department, role: "EMPLOYEE" },
      select: { id: true, name: true, email: true, department: true, createdAt: true },
    });
    sendSuccess(res, { employee }, "Employee created", 201);
  } catch (err) {
    next(err);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, department, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role === "ADMIN") return sendError(res, "Employee not found", 404);

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email.toLowerCase().trim();
    if (department) data.department = department;
    if (password) data.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const employee = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, department: true },
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
    if (!existing || existing.role === "ADMIN") return sendError(res, "Employee not found", 404);
    await prisma.user.delete({ where: { id } });
    sendSuccess(res, {}, "Employee deleted");
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };
