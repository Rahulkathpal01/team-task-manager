/**
 * Dashboard Page
 *
 * Orchestrates all dashboard data fetching and renders:
 *   1. Greeting + role badge
 *   2. DashboardMetrics (KPI cards + status bar)
 *   3. Projects section  (+ "New Project" for ADMIN)
 *   4. Tasks section     (+ "New Task" for ADMIN)
 *
 * Data fetching strategy:
 *   - useEffect on mount fetches metrics, projects, and all tasks in parallel.
 *   - `refresh()` re-fetches everything (called after create/delete/status change).
 */

import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Loader2, AlertCircle } from "lucide-react";

import Layout            from "../components/Layout";
import DashboardMetrics  from "../components/DashboardMetrics";
import ProjectCard       from "../components/ProjectCard";
import TaskTable         from "../components/TaskTable";
import CreateProjectModal from "../components/CreateProjectModal";
import CreateTaskModal   from "../components/CreateTaskModal";

import { useAuth }                                    from "../context/AuthContext";
import { dashboardAPI, projectAPI, taskAPI }          from "../api/api";

// ── Section wrapper ───────────────────────────────────────────
const Section = ({ title, action, children }) => (
  <section className="mt-10">
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-mono font-bold text-text text-sm uppercase tracking-widest">
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
);

// ── Skeleton loader ───────────────────────────────────────────
const Skeleton = ({ className = "" }) => (
  <div className={`bg-surface border border-border rounded animate-pulse ${className}`} />
);

const MetricsSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
    </div>
    <Skeleton className="h-20" />
  </div>
);

// ── Error Banner ──────────────────────────────────────────────
const ErrorBanner = ({ message, onRetry }) => (
  <div className="flex items-center gap-3 bg-danger/10 border border-danger/20
                  text-danger text-xs font-mono px-4 py-3 rounded">
    <AlertCircle size={13} className="shrink-0" />
    <span>{message}</span>
    {onRetry && (
      <button onClick={onRetry} className="ml-auto underline hover:no-underline">
        Retry
      </button>
    )}
  </div>
);

// ── Main Component ────────────────────────────────────────────
const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  const [metrics,  setMetrics]  = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks,    setTasks]    = useState([]);

  const [loadingMetrics,  setLoadingMetrics]  = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks,    setLoadingTasks]    = useState(true);

  const [errorMetrics,  setErrorMetrics]  = useState("");
  const [errorProjects, setErrorProjects] = useState("");
  const [errorTasks,    setErrorTasks]    = useState("");

  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewTask,    setShowNewTask]    = useState(false);

  // ── Fetch helpers ──────────────────────────────────────────

  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    setErrorMetrics("");
    try {
      const { data } = await dashboardAPI.getMetrics();
      setMetrics(data.data);
    } catch {
      setErrorMetrics("Failed to load metrics.");
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    setErrorProjects("");
    try {
      const { data } = await projectAPI.getAll();
      setProjects(data.data);
    } catch {
      setErrorProjects("Failed to load projects.");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    setErrorTasks("");
    try {
      // For dashboard overview: fetch tasks from all visible projects in parallel
      const { data: projData } = await projectAPI.getAll();
      const projectList = projData.data;

      if (!projectList.length) { setTasks([]); setLoadingTasks(false); return; }

      const taskResponses = await Promise.allSettled(
        projectList.map((p) => taskAPI.getByProject(p.id))
      );

      const allTasks = taskResponses
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => r.value.data.data)
        // Attach projectId explicitly so TaskTable can call the update endpoint
        .map((t) => ({ ...t, projectId: t.project?.id || t.projectId }));

      // Sort: overdue first, then by creation date desc
      allTasks.sort((a, b) => {
        const aOver = a.dueDate && a.status !== "COMPLETED" && new Date(a.dueDate) < new Date();
        const bOver = b.dueDate && b.status !== "COMPLETED" && new Date(b.dueDate) < new Date();
        if (aOver && !bOver) return -1;
        if (!aOver && bOver) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setTasks(allTasks);
    } catch {
      setErrorTasks("Failed to load tasks.");
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  // ── Full refresh (after mutations) ────────────────────────
  const refresh = useCallback(() => {
    fetchMetrics();
    fetchProjects();
    fetchTasks();
  }, [fetchMetrics, fetchProjects, fetchTasks]);

  // Initial load
  useEffect(() => { refresh(); }, []);

  // ── Mutation callbacks ─────────────────────────────────────

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
    fetchMetrics(); // update project count
  };

  const handleProjectDeleted = (deletedId) => {
    setProjects((prev) => prev.filter((p) => p.id !== deletedId));
    setTasks((prev) => prev.filter((t) => t.projectId !== deletedId));
    fetchMetrics();
  };

  const handleTaskCreated = (newTask) => {
    const enriched = { ...newTask, projectId: newTask.project?.id || newTask.projectId };
    setTasks((prev) => [enriched, ...prev]);
    fetchMetrics();
  };

  // ── Render ─────────────────────────────────────────────────

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Layout>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-mono font-bold text-2xl text-text tracking-tight">
            {greeting()},{" "}
            <span className="text-amber">{user?.name?.split(" ")[0]}</span>
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <p className="text-sm text-dim">Here's your workspace overview.</p>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border
                             ${isAdmin
                               ? "text-amber border-amber/30 bg-amber/10"
                               : "text-dim  border-border   bg-surface"}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={refresh}
          disabled={loadingMetrics || loadingProjects || loadingTasks}
          className="btn-ghost flex items-center gap-1.5 text-xs"
          title="Refresh all data"
        >
          <RefreshCw
            size={12}
            className={(loadingMetrics || loadingProjects || loadingTasks) ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* ── Metrics ──────────────────────────────────────────── */}
      {loadingMetrics ? (
        <MetricsSkeleton />
      ) : errorMetrics ? (
        <ErrorBanner message={errorMetrics} onRetry={fetchMetrics} />
      ) : metrics ? (
        <DashboardMetrics metrics={metrics} />
      ) : null}

      {/* ── Projects Section ─────────────────────────────────── */}
      <Section
        title={`Projects ${projects.length ? `(${projects.length})` : ""}`}
        action={
          isAdmin && (
            <button
              onClick={() => setShowNewProject(true)}
              className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3"
            >
              <Plus size={13} /> New Project
            </button>
          )
        }
      >
        {loadingProjects ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : errorProjects ? (
          <ErrorBanner message={errorProjects} onRetry={fetchProjects} />
        ) : projects.length === 0 ? (
          <div className="card py-10 text-center">
            <p className="text-dim text-sm font-mono">
              {isAdmin ? "No projects yet. Create your first one!" : "You have no assigned projects."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <div key={project.id} style={{ animationDelay: `${i * 50}ms` }}>
                <ProjectCard
                  project={project}
                  isAdmin={isAdmin}
                  onDelete={handleProjectDeleted}
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Tasks Section ─────────────────────────────────────── */}
      <Section
        title={`All Tasks ${tasks.length ? `(${tasks.length})` : ""}`}
        action={
          isAdmin && (
            <button
              onClick={() => setShowNewTask(true)}
              disabled={!projects.length}
              className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3
                         disabled:opacity-40 disabled:cursor-not-allowed"
              title={!projects.length ? "Create a project first" : undefined}
            >
              <Plus size={13} /> New Task
            </button>
          )
        }
      >
        {loadingTasks ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : errorTasks ? (
          <ErrorBanner message={errorTasks} onRetry={fetchTasks} />
        ) : (
          <TaskTable
            tasks={tasks}
            isAdmin={isAdmin}
            onTasksChange={() => { fetchMetrics(); fetchTasks(); }}
          />
        )}
      </Section>

      {/* ── Modals ────────────────────────────────────────────── */}
      <CreateProjectModal
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        onSuccess={handleProjectCreated}
      />
      <CreateTaskModal
        open={showNewTask}
        onClose={() => setShowNewTask(false)}
        onSuccess={handleTaskCreated}
        projects={projects}
      />
    </Layout>
  );
};

export default Dashboard;