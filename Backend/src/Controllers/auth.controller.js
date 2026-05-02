/**
 * Auth Controller
 * Handles user registration and login.
 * Passwords are hashed with bcrypt before storage.
 * Successful auth returns a signed JWT.
 */

const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const prisma = require("../config/db");
const { signToken } = require("../utils/jwt");

/**
 * Strips the password field before sending a user object to the client.
 * @param {object} user - Prisma user record
 */
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

/**
 * POST /api/auth/register
 * Body: { name, email, password, role? }
 *
 * Creates a new user. Role defaults to MEMBER.
 * In production you'd want to gate ADMIN creation separately.
 */
const register = async (req, res, next) => {
  try {
    // 1. Validate incoming request body (see auth.routes.js for rules)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // 2. Check for duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // 3. Hash the password — saltRounds: 12 is a good balance of security & speed
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create the user record
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Only allow explicit role if provided; otherwise default to MEMBER
        role: role === "ADMIN" ? "ADMIN" : "MEMBER",
      },
    });

    // 5. Sign JWT — embed id and role for quick access in middleware
    const token = signToken({ id: user.id, role: user.role });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error); // Passed to global error handler in server.js
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * Verifies credentials and returns a JWT on success.
 */
const login = async (req, res, next) => {
  try {
    // 1. Validate body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // 2. Find user — include password field for comparison
    const user = await prisma.user.findUnique({ where: { email } });

    // 3. Use a generic error message to prevent user enumeration attacks
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 4. Issue JWT
    const token = signToken({ id: user.id, role: user.role });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Protected — returns the currently authenticated user.
 * Useful for the frontend to rehydrate auth state on page refresh.
 */
const getMe = async (req, res) => {
  // req.user is already attached by the `protect` middleware
  return res.status(200).json({ success: true, user: req.user });
};

module.exports = { register, login, getMe };