/**
 * CreateProjectModal — ADMIN only
 * A slide-in modal for creating a new project.
 * Calls POST /api/projects and invokes onSuccess to refresh the list.
 */

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { projectAPI } from "../api/api";

const CreateProjectModal = ({ open, onClose, onSuccess }) => {
  const [form, setForm]     = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (open) { setForm({ name: "", description: "" }); setError(""); }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Project name is required."); return; }

    setLoading(true);
    setError("");
    try {
      const { data } = await projectAPI.create(form);
      onSuccess(data.data); // pass the new project back to parent
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card w-full max-w-md animate-fade-up shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-mono font-bold text-text text-sm tracking-wide uppercase">
            New Project
          </h2>
          <button onClick={onClose} className="text-dim hover:text-text transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <p className="text-xs font-mono text-danger bg-danger/10 px-3 py-2 rounded border border-danger/20">
              {error}
            </p>
          )}
          <div>
            <label className="block text-xs font-mono text-dim mb-1.5 uppercase tracking-widest">
              Project Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="field"
              placeholder="e.g. Q3 Marketing Campaign"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-dim mb-1.5 uppercase tracking-widest">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="field resize-none"
              rows={3}
              placeholder="What is this project about?"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading && <Loader2 size={13} className="animate-spin" />}
              Create Project
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;