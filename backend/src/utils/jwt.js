/**
 * JWT Utilities
 * Centralises token signing and verification so the secret
 * and expiry config live in one place.
 */

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Signs a JWT payload and returns the token string.
 * @param {object} payload - Data to embed (e.g. { id, role })
 * @returns {string} Signed JWT
 */
const signToken = (payload) => {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifies a JWT and returns the decoded payload.
 * Throws a JsonWebTokenError if invalid or expired.
 * @param {string} token
 * @returns {object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { signToken, verifyToken };