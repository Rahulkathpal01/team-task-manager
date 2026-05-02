/**
 * Dashboard Controller
 *
 * GET /api/dashboard
 *
 * Returns aggregated metrics:
 *   - totalTasks
 *   - tasksByStatus (PENDING, IN_PROGRESS, COMPLETED counts)
 *   - overdueTasks  (past dueDate and not COMPLETED)
 *   - totalProjects
 *
 * ADMIN  → metrics across ALL tasks/projects.
 * MEMBER → metrics scoped to their assigned tasks only.
 */

const prisma = require("../config/db");

const getDashboardMetrics = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const now = new Date();

    // Scope filter — reused across all queries
    const taskWhere = isAdmin ? {} : { assigneeId: req.user.id };

    // Run all aggregation queries in parallel for performance
    const [
      totalTasks,
      totalProjects,
      pendingCount,
      inProgressCount,
      completedCount,
      overdueCount,
      recentTasks,
    ] = await Promise.all([
      // Total task count
      prisma.task.count({ where: taskWhere }),

      // Total projects (admins see all; members see projects with their tasks)
      prisma.project.count({
        where: isAdmin ? {} : { tasks: { some: { assigneeId: req.user.id } } },
      }),

      // Status breakdowns
      prisma.task.count({ where: { ...taskWhere, status: "PENDING" } }),
      prisma.task.count({ where: { ...taskWhere, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { ...taskWhere, status: "COMPLETED" } }),

      // Overdue = has a dueDate in the past AND is not yet COMPLETED
      prisma.task.count({
        where: {
          ...taskWhere,
          dueDate: { lt: now },
          status: { not: "COMPLETED" },
        },
      }),

      // 5 most recently updated tasks for the activity feed
      prisma.task.findMany({
        where: taskWhere,
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalTasks,
        totalProjects,
        tasksByStatus: {
          PENDING: pendingCount,
          IN_PROGRESS: inProgressCount,
          COMPLETED: completedCount,
        },
        overdueTasks: overdueCount,
        recentTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardMetrics };