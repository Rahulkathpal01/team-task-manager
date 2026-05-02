/**
 * TaskTable
 *
 * Renders a list of tasks with inline status update via dropdown.
 * - Any authenticated user can change status of their visible tasks.
 * - ADMIN additionally sees Delete button per task.
 * - Status changes are optimistic: UI updates immediately, then API is called.
 *   On failure the previous value is restored.
 */

import { useState } from "react";
import { Trash2, Calendar, User, ChevronDown } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { taskAPI } from "../api/api";

const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];

const isOverdue = (task) =>
  task.dueDate &&
  task.status !== "COMPLETED" &&
  new Date(task.dueDate) < new Date();

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

const TaskTable = ({ tasks: initialTasks, isAdmin, onTasksChange }) => {
  const [tasks,         setTasks]         = useState(initialTasks);
  const [updatingId,    setUpdatingId]    = useState(null); // taskId being saved
  const [deletingId,    setDeletingId]    = useState(null);
  const [statusError,   setStatusError]   = useState({}); // { [taskId]: errorMsg }

  // Keep in sync when parent re-fetches
  // (Simple approach — replace when parent passes fresh data)
  if (initialTasks !== tasks && initialTasks.length !== tasks.length) {
    setTasks(initialTasks);
  }

  /**
   * Optimistic status update:
   * 1. Immediately update local state
   * 2. Call PATCH API
   * 3. If it fails, roll back to previous status and show an error
   */
  const handleStatusChange = async (task, newStatus) => {
    const prevStatus = task.status;
    if (prevStatus === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => t.id === task.id ? { ...t, status: newStatus } : t)
    );
    setUpdatingId(task.id);
    setStatusError((prev) => ({ ...prev, [task.id]: "" }));

    try {
      await taskAPI.update(task.projectId, task.id, { status: newStatus });
      // Notify parent so dashboard metrics can refresh
      onTasksChange?.();
    } catch (err) {
      // Roll back on failure
      setTasks((prev) =>
        prev.map((t) => t.id === task.id ? { ...t, status: prevStatus } : t)
      );
      setStatusError((prev) => ({
        ...prev,
        [task.id]: err.response?.data?.message || "Update failed",
      }));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"? This cannot be undone.`)) return;
    setDeletingId(task.id);
    try {
      await taskAPI.remove(task.projectId, task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      onTasksChange?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!tasks.length) {
    return (
      <div className="card py-12 text-center">
        <p className="text-dim text-sm font-mono">No tasks found.</p>
        {isAdmin && (
          <p className="text-dim/60 text-xs font-mono mt-1">
            Use "New Task" above to create one.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Task", "Project", "Assignee", "Due Date", "Status", isAdmin && ""].filter(Boolean).map((h, i) => (
                <th
                  key={i}
                  className="text-left text-[10px] font-mono text-dim uppercase tracking-widest
                             px-4 py-3 font-normal"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, idx) => {
              const overdue = isOverdue(task);
              return (
                <tr
                  key={task.id}
                  className={`border-b border-border/60 last:border-0 transition-colors
                              ${overdue ? "bg-danger/5" : "hover:bg-white/[0.02]"}
                              animate-fade-up`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {/* Title + description */}
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="font-medium text-text truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-dim truncate mt-0.5">{task.description}</p>
                    )}
                    {statusError[task.id] && (
                      <p className="text-[10px] text-danger mt-0.5 font-mono">
                        ⚠ {statusError[task.id]}
                      </p>
                    )}
                  </td>

                  {/* Project */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-dim bg-border/40 px-2 py-0.5 rounded">
                      {task.project?.name ?? "—"}
                    </span>
                  </td>

                  {/* Assignee */}
                  <td className="px-4 py-3">
                    {task.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-amber/20 flex items-center justify-center
                                        text-[9px] font-mono text-amber font-bold shrink-0">
                          {task.assignee.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-text truncate max-w-[80px]">
                          {task.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-dim">—</span>
                    )}
                  </td>

                  {/* Due date */}
                  <td className="px-4 py-3">
                    {task.dueDate ? (
                      <span className={`flex items-center gap-1 text-xs font-mono
                                       ${overdue ? "text-danger" : "text-dim"}`}>
                        <Calendar size={10} />
                        {formatDate(task.dueDate)}
                        {overdue && <span className="badge-overdue ml-1">Overdue</span>}
                      </span>
                    ) : (
                      <span className="text-xs text-dim/40">—</span>
                    )}
                  </td>

                  {/* Status dropdown */}
                  <td className="px-4 py-3">
                    <div className="relative inline-flex items-center">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                        disabled={updatingId === task.id}
                        className={`appearance-none text-xs font-mono pr-6 pl-2 py-1.5 rounded border
                                    bg-surface cursor-pointer transition-colors
                                    focus:outline-none focus:border-amber
                                    disabled:opacity-50 disabled:cursor-wait
                                    ${task.status === "COMPLETED" ? "border-success/30 text-success"
                                    : task.status === "IN_PROGRESS" ? "border-amber/30 text-amber"
                                    : "border-border text-dim"}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={10}
                        className="absolute right-1.5 text-dim pointer-events-none"
                      />
                      {updatingId === task.id && (
                        <span className="absolute -right-4 top-1/2 -translate-y-1/2
                                         w-2.5 h-2.5 border border-amber border-t-transparent
                                         rounded-full animate-spin" />
                      )}
                    </div>
                  </td>

                  {/* Delete — ADMIN only */}
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(task)}
                        disabled={deletingId === task.id}
                        className="p-1.5 text-dim hover:text-danger hover:bg-danger/10 rounded
                                   transition-colors disabled:opacity-40"
                        title="Delete task"
                      >
                        {deletingId === task.id
                          ? <span className="w-3 h-3 border border-danger border-t-transparent rounded-full animate-spin block" />
                          : <Trash2 size={13} />
                        }
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-border">
        {tasks.map((task) => {
          const overdue = isOverdue(task);
          return (
            <div key={task.id} className={`p-4 ${overdue ? "bg-danger/5" : ""}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text text-sm truncate">{task.title}</p>
                  {task.project && (
                    <p className="text-xs text-dim font-mono mt-0.5">{task.project.name}</p>
                  )}
                </div>
                <StatusBadge status={overdue ? "OVERDUE" : task.status} />
              </div>

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {/* Assignee */}
                {task.assignee && (
                  <span className="flex items-center gap-1 text-xs text-dim font-mono">
                    <User size={10} /> {task.assignee.name}
                  </span>
                )}
                {/* Due date */}
                {task.dueDate && (
                  <span className={`flex items-center gap-1 text-xs font-mono
                                   ${overdue ? "text-danger" : "text-dim"}`}>
                    <Calendar size={10} /> {formatDate(task.dueDate)}
                  </span>
                )}
              </div>

              {/* Status + Delete row */}
              <div className="flex items-center justify-between mt-3">
                <div className="relative inline-flex items-center">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    disabled={updatingId === task.id}
                    className="appearance-none text-xs font-mono pr-6 pl-2 py-1.5
                               rounded border border-border bg-surface text-dim
                               focus:outline-none focus:border-amber disabled:opacity-50"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                  <ChevronDown size={10} className="absolute right-1.5 text-dim pointer-events-none" />
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(task)}
                    className="p-1.5 text-dim hover:text-danger hover:bg-danger/10 rounded transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskTable;