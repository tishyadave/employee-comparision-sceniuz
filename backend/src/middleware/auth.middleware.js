const { verifyToken } = require("../utils/jwt");
const { sendError } = require("../utils/response");
const prisma = require("../utils/prisma");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "No token provided", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, department: true },
    });

    if (!user) return sendError(res, "User not found", 401);

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") return sendError(res, "Token expired", 401);
    if (err.name === "JsonWebTokenError") return sendError(res, "Invalid token", 401);
    next(err);
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return sendError(res, "Not authenticated", 401);
  // SUPER_ADMIN is a superset — it passes any role check automatically
  if (req.user.role === "SUPER_ADMIN") return next();
  if (!roles.includes(req.user.role)) {
    return sendError(res, "Insufficient permissions", 403);
  }
  next();
};

// Shorthand: only SUPER_ADMIN can pass
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) return sendError(res, "Not authenticated", 401);
  if (req.user.role !== "SUPER_ADMIN") {
    return sendError(res, "Super Admin access required", 403);
  }
  next();
};

module.exports = { authenticate, requireRole, requireSuperAdmin };
