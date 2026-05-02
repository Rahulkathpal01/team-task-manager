/**
 * Dashboard Routes
 * GET /api/dashboard — protected, available to all authenticated roles.
 */

const { Router } = require("express");
const { getDashboardMetrics } = require("../Controllers/dashboard.controller");
const { protect } = require("../middleware/auth.middleware");

const router = Router();

router.get("/", protect, getDashboardMetrics);

module.exports = router;
