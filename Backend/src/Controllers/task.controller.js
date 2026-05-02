/**
 * Task Controller
 *
 * ADMIN  → full CRUD on tasks within any project.
 * MEMBER → can only update the `status` of tasks assigned to them.
 *
 * All task routes are nested under /api/projects/:projectId/tasks
 * so projectId is always available in req.params.
 */

const { validationResult } = require("express-validator");
const prisma = require("../config/db");

// ── Helper ────────────────────────────────────────────────────

/**
 * Verifies a project exists and the requesting user has access to it.
 * Members must have at least one task in the project to access it.
 */
const assertProjectAccess = async (projectId, user) => {
  const isAdmin = user.role === "ADMIN";
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...(isAdmin ? {} : { tasks: { some: { assigneeId: user.id } } }),
    },
  });
  return project; // null → no access
};

// ── Controllers ───────────────────────────────────────────────

/**
 * POST /api/projects/:projectId/tasks
 * ADMIN only — creates a task and optionally assigns it to a member.
 */
const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });

    const { projectId } = req.params;
    const { title, description, status, dueDate, assigneeId } = req.body;

    // Verify the project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project)
      return res.status(404).json({ success: false, message: "Project not found." });

    // If assigneeId is provided, verify the user exists and is a MEMBER
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (!assignee)
        return res.status(404).json({ success: false, message: "Assignee user not found." });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "PENDING",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/:projectId/tasks
 * ADMIN → all tasks in the project.
 * MEMBER → only their assigned tasks in the project.
 */
const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const isAdmin = req.user.role === "ADMIN";

    const project = await assertProjectAccess(projectId, req.user);
    if (!project)
      return res.status(404).json({ success: false, message: "Project not found or access denied." });

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        // Members only see their own tasks
        ...(isAdmin ? {} : { assigneeId: req.user.id }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/:projectId/tasks/:taskId
 * ADMIN → any task. MEMBER → only their assigned task.
 */
const getTaskById = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const isAdmin = req.user.role === "ADMIN";

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
        ...(isAdmin ? {} : { assigneeId: req.user.id }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!task)
      return res.status(404).json({ success: false, message: "Task not found or access denied." });

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/projects/:projectId/tasks/:taskId
 *
 * ADMIN  → can update all fields (title, description, status, dueDate, assigneeId).
 * MEMBER → can update ONLY the `status` of their own assigned task.
 *
 * This single handler serves both roles with field-level access control.
 */
const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });

    const { projectId, taskId } = req.params;
    const isAdmin = req.user.role === "ADMIN";

    // Find the task — members can only touch their own
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
        ...(isAdmin ? {} : { assigneeId: req.user.id }),
      },
    });

    if (!task)
      return res.status(404).json({ success: false, message: "Task not found or access denied." });

    // Build the update payload based on role
    let updateData = {};

    if (isAdmin) {
      // ADMIN can update any field
      const { title, description, status, dueDate, assigneeId } = req.body;
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status) updateData.status = status;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (assigneeId !== undefined) {
        // Allow unassigning (null) or reassigning
        if (assigneeId) {
          const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
          if (!assignee)
            return res.status(404).json({ success: false, message: "Assignee not found." });
        }
        updateData.assigneeId = assigneeId || null;
      }
    } else {
      // MEMBER can ONLY update status — all other fields are silently ignored
      const { status } = req.body;
      if (!status)
        return res.status(400).json({ success: false, message: "Members can only update task status." });
      updateData.status = status;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/projects/:projectId/tasks/:taskId
 * ADMIN only.
 */
const deleteTask = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;

    const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });
    if (!task)
      return res.status(404).json({ success: false, message: "Task not found." });

    await prisma.task.delete({ where: { id: taskId } });

    return res.status(200).json({ success: true, message: "Task deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasksByProject, getTaskById, updateTask, deleteTask };