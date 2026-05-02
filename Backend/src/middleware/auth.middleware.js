/**
 * Authentication & Authorization Middleware
 *
 * protect     — verifies the JWT in the Authorization header
 *               and attaches the decoded user to req.user
 *
 * restrictTo  — factory that returns a middleware checking
 *               whether req.user.role is in the allowed list
 */

const { verifyToken } = require("../utils/jwt");
const prisma = require("../config/db");

/**
 * Protects a route — must be called before restrictTo.
 * Expects: Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token integrity & expiry
    const decoded = verifyToken(token);

    // 3. Check the user still exists in the database
    //    (handles the case where a user was deleted after token was issued)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    // 4. Attach user to request object for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    // jwt.verify throws specific errors we can surface clearly
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    next(error);
  }
};

/**
 * Role-based access control — call AFTER protect().
 * Usage: router.post("/", protect, restrictTo("ADMIN"), handler)
 *
 * @param  {...string} roles - Allowed roles, e.g. "ADMIN", "MEMBER"
 * @returns Express middleware
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of: [${roles.join(", ")}].`,
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };