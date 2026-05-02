/**
 * Project Controller
 *
 * ADMIN  → createProject, getAllProjects, getProjectById, updateProject, deleteProject
 * MEMBER → getAllProjects (only projects where they have an assigned task), getProjectById
 */

const { validationResult } = require("express-validator");
const prisma = require("../config/db");

/**
 * POST /api/projects
 * ADMIN only — creates a new project.
 */
const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });

    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: req.user.id, // injected by `protect` middleware
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
    });

    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects
 * ADMIN  → sees all projects.
 * MEMBER → sees only projects where at least one task is assigned to them.
 */
const getAllProjects = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "ADMIN";

    const projects = await prisma.project.findMany({
      where: isAdmin
        ? {} // no filter — admins see everything
        : { tasks: { some: { assigneeId: req.user.id } } },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/:id
 * ADMIN  → any project.
 * MEMBER → only if they have a task in this project.
 */
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === "ADMIN";

    const project = await prisma.project.findFirst({
      where: {
        id,
        // Members can only access projects they participate in
        ...(isAdmin ? {} : { tasks: { some: { assigneeId: req.user.id } } }),
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project)
      return res.status(404).json({ success: false, message: "Project not found or access denied." });

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/projects/:id
 * ADMIN only — updates name/description.
 */
const updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });

    const { id } = req.params;
    const { name, description } = req.body;

    // Verify the project exists before attempting update
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ success: false, message: "Project not found." });

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
    });

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/projects/:id
 * ADMIN only — cascades to tasks (configured in schema via onDelete: Cascade).
 */
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ success: false, message: "Project not found." });

    await prisma.project.delete({ where: { id } });

    return res.status(200).json({ success: true, message: "Project deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getAllProjects, getProjectById, updateProject, deleteProject };