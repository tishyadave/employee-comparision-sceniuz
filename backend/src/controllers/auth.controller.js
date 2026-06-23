const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { generateToken } = require("../utils/jwt");
const { sendSuccess, sendError } = require("../utils/response");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return sendError(res, "Invalid email or password", 401);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return sendError(res, "Invalid email or password", 401);

    const token = generateToken({ id: user.id, role: user.role });

    sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      },
      "Login successful"
    );
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, department: true, createdAt: true },
    });
    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe };
