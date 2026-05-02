/**
 * CreateTaskModal — ADMIN only
 * Creates a task under a selected project.
 * Fetches the users list for the assignee picker.
 */

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { taskAPI, userAPI } from "../api/api";

const CreateTaskModal = ({ open, onClose, onSuccess, projects }) => {
  const [form, setForm] = useState({
    projectId: "",
    title: "",
    description: "",
    status: "PENDING",
    dueDate: "",
    assigneeId: "",
  });
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  // Fetch assignable users once when modal opens
  useEffect(() => {
    if (!open) return;
    setForm({ projectId: projects[0]?.id || "", title: "", description: "",
              status: "PENDING", dueDate: "", assigneeId: "" });
    setError("");
    setLoading(true);
    userAPI.getAll()
      .then(({ data }) => setUsers(data.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Task title is required."); return; }
    if (!form.projectId)    { setError("Please select a project."); return; }

    setSaving(true);
    setError("");
    try {
      const payload = {
        title:       form.title,
        description: form.description,
        status:      form.status,
        dueDate:     form.dueDate || undefined,
        assigneeId:  form.assigneeId || undefined,
      };
      const { data } = await taskAPI.create(form.projectId, payload);
      onSuccess(data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task.");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-xs font-mono text-dim mb-1.5 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card w-full max-w-lg animate-fade-up shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-mono font-bold text-text text-sm tracking-wide uppercase">
            New Task
          </h2>
          <button onClick={onClose} className="text-dim hover:text-text transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <p className="text-xs font-mono text-danger bg-danger/10 px-3 py-2 rounded border border-danger/20">
              {error}
            </p>
          )}

          {/* Project selector */}
          <Field label="Project *">
            <select
              value={form.projectId}
              onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}
              className="field"
            >
              <option value="">Select a project…</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>{proj.name}</option>
              ))}
            </select>
          </Field>

          {/* Title */}
          <Field label="Task Title *">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="field"
              placeholder="e.g. Design landing page mockup"
              autoFocus
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="field resize-none"
              rows={2}
              placeholder="Optional task details…"
            />
          </Field>

          {/* Status + Due Date — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="field"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </Field>
            <Field label="Due Date">
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="field"
              />
            </Field>
          </div>

          {/* Assignee */}
          <Field label="Assign To">
            {loading ? (
              <div className="flex items-center gap-2 text-dim text-xs font-mono py-2">
                <Loader2 size={12} className="animate-spin" /> Loading users…
              </div>
            ) : (
              <select
                value={form.assigneeId}
                onChange={(e) => setForm((p) => ({ ...p, assigneeId: e.target.value }))}
                className="field"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            )}
          </Field>

          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving && <Loader2 size={13} className="animate-spin" />}
              Create Task
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;