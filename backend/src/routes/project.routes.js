/**
 * Project Routes
 *
 * All routes are protected (JWT required).
 * Write operations are ADMIN-only via restrictTo("ADMIN").
 *
 * POST   /api/projects          → Create project    [ADMIN]
 * GET    /api/projects          → List projects     [ADMIN + MEMBER]
 * GET    /api/projects/:id      → Get one project   [ADMIN + MEMBER]
 * PATCH  /api/projects/:id      → Update project    [ADMIN]
 * DELETE /api/projects/:id      → Delete project    [ADMIN]
 */

const { Router } = require("express");
const { body } = require("express-validator");
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../Controllers/project.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

const router = Router();

// Every project route requires a valid JWT
router.use(protect);

const projectValidation = [
  body("name").trim().notEmpty().withMessage("Project name is required."),
  body("description").optional().trim(),
];

router
  .route("/")
  .get(getAllProjects)                                // ADMIN + MEMBER
  .post(restrictTo("ADMIN"), projectValidation, createProject); // ADMIN only

router
  .route("/:id")
  .get(getProjectById)                               // ADMIN + MEMBER
  .patch(restrictTo("ADMIN"), projectValidation, updateProject)  // ADMIN only
  .delete(restrictTo("ADMIN"), deleteProject);       // ADMIN only

module.exports = router;
