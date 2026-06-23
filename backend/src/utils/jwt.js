const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const generateToken = (payload) => {
  if (!SECRET) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
};

const verifyToken = (token) => {
  if (!SECRET) throw new Error("JWT_SECRET is not defined");
  return jwt.verify(token, SECRET);
};

module.exports = { generateToken, verifyToken };
