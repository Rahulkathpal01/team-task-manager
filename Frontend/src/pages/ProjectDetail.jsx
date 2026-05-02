/**
 * ProjectDetail Page (/projects/:id)
 * Shows a single project with its full task list.
 * ADMIN: can create, update, delete tasks.
 * MEMBER: can update status of their assigned tasks.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Loader2, FolderKanban } from "lucide-react";
import Layout           from "../components/layout";
import TaskTable        from "../components/TaskTable";
import CreateTaskModal  from "../components/CreateTaskModal";
import StatusBadge      from "../components/StatusBadge";
import { useAuth }      from "../context/AuthContext";
import { projectAPI, taskAPI } from "../api/api";

const ProjectDetail = () => {
  const { id }     = useParams();
  const { isAdmin } = useAuth();

  const [project,   setProject]   = useState(null);
  const [tasks,     setTasks]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Project detail includes tasks from the backend
      const [projRes, taskRes] = await Promise.all([
        projectAPI.getById(id),
        taskAPI.getByProject(id),
      ]);
      setProject(projRes.data.data);
      const enriched = taskRes.data.data.map((t) => ({ ...t, projectId: id }));
      setTasks(enriched);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  // Metrics derived from local task state
  const counts = tasks.reduce(
    (acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; },
    {}
  );

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center py-32">
        <Loader2 size={22} className="animate-spin text-amber" />
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="card py-16 text-center max-w-md mx-auto mt-10">
        <p className="text-danger text-sm font-mono mb-4">{error}</p>
        <Link to="/projects" className="btn-ghost text-xs">← Back to Projects</Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      {/* Back link */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-dim
                   hover:text-amber transition-colors mb-6 animate-fade-up"
      >
        <ArrowLeft size={12} /> All Projects
      </Link>

      {/* Project header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 animate-fade-up">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-amber/10 rounded-lg text-amber mt-0.5 shrink-0">
            <FolderKanban size={18} />
          </div>
          <div>
            <h1 className="font-mono font-bold text-2xl text-text tracking-tight">
              {project?.name}
            </h1>
            {project?.description && (
              <p className="text-sm text-dim mt-1 max-w-lg">{project.description}</p>
            )}
            <p className="text-xs text-dim font-mono mt-2">
              Created by <span className="text-text">{project?.createdBy?.name}</span>
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 self-start shrink-0"
          >
            <Plus size={14} /> New Task
          </button>
        )}
      </div>

      {/* Mini stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-up" style={{ animationDelay: "80ms" }}>
        {[
          { label: "Pending",     key: "PENDING",     color: "text-dim"     },
          { label: "In Progress", key: "IN_PROGRESS", color: "text-amber"   },
          { label: "Completed",   key: "COMPLETED",   color: "text-success" },
        ].map(({ label, key, color }) => (
          <div key={key} className="card px-4 py-3 text-center">
            <p className={`font-mono font-bold text-xl ${color}`}>{counts[key] ?? 0}</p>
            <p className="text-[10px] font-mono text-dim uppercase tracking-widest mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Task list */}
      <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono font-bold text-sm text-text uppercase tracking-widest">
            Tasks {tasks.length ? `(${tasks.length})` : ""}
          </h2>
        </div>

        <TaskTable
          tasks={tasks}
          isAdmin={isAdmin}
          onTasksChange={fetch}
        />
      </div>

      {/* Create task modal */}
      <CreateTaskModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(newTask) => {
          const enriched = { ...newTask, projectId: id };
          setTasks((prev) => [enriched, ...prev]);
        }}
        projects={project ? [project] : []}
      />
    </Layout>
  );
};

export default ProjectDetail;
