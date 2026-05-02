/**
 * User Routes
 * GET /api/users — ADMIN only, returns list of all users for the assignee picker.
 */

const { Router } = require("express");
const prisma = require("../config/db");
const { protect, restrictTo } = require("../middleware/auth.middleware");

const router = Router();

router.get("/", protect, restrictTo("ADMIN"), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;