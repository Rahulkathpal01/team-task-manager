/**
 * Auth Routes
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me      (protected)
 */

const { Router } = require("express");
const { body } = require("express-validator");
const { register, login, getMe } = require("../Controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = Router();

// ── Validation rules ─────────────────────────────────────────

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
];

const loginValidation = [
  body("email").trim().isEmail().normalizeEmail().withMessage("Valid email required."),
  body("password").notEmpty().withMessage("Password is required."),
];

// ── Route definitions ─────────────────────────────────────────

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", protect, getMe);

module.exports = router;
