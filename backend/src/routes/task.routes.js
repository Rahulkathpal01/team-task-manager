/**
 * Task Routes — nested under projects for clean REST semantics.
 *
 * All routes require a valid JWT (protect).
 * mergeParams: true allows access to :projectId from the parent router.
 *
 * POST   /api/projects/:projectId/tasks              [ADMIN]
 * GET    /api/projects/:projectId/tasks              [ADMIN + MEMBER]
 * GET    /api/projects/:projectId/tasks/:taskId      [ADMIN + MEMBER]
 * PATCH  /api/projects/:projectId/tasks/:taskId      [ADMIN (all fields) | MEMBER (status only)]
 * DELETE /api/projects/:projectId/tasks/:taskId      [ADMIN]
 */

const { Router } = require("express");
const { body } = require("express-validator");
const {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../Controllers/task.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

// mergeParams lets us read :projectId defined in project.routes.js
const router = Router({ mergeParams: true });

router.use(protect);

// Validation for create / admin-level updates
const taskCreateValidation = [
  body("title").trim().notEmpty().withMessage("Task title is required."),
  body("description").optional().trim(),
  body("status")
    .optional()
    .isIn(["PENDING", "IN_PROGRESS", "COMPLETED"])
    .withMessage("Status must be PENDING, IN_PROGRESS, or COMPLETED."),
  body("dueDate").optional().isISO8601().withMessage("dueDate must be a valid ISO 8601 date."),
  body("assigneeId").optional().isString(),
];

// Validation for member status-only update
const taskUpdateValidation = [
  body("status")
    .optional()
    .isIn(["PENDING", "IN_PROGRESS", "COMPLETED"])
    .withMessage("Status must be PENDING, IN_PROGRESS, or COMPLETED."),
];

router
  .route("/")
  .get(getTasksByProject)                                      // ADMIN + MEMBER
  .post(restrictTo("ADMIN"), taskCreateValidation, createTask); // ADMIN only

router
  .route("/:taskId")
  .get(getTaskById)                                            // ADMIN + MEMBER
  .patch(taskUpdateValidation, updateTask)                     // Both roles — controller enforces field limits
  .delete(restrictTo("ADMIN"), deleteTask);                    // ADMIN only

module.exports = router;
