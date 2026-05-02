/**
 * DashboardMetrics
 * Renders the 4 KPI cards at the top of the dashboard.
 * Receives pre-fetched `metrics` as a prop so it stays purely presentational.
 */

import { CheckSquare, Clock, AlertTriangle, FolderOpen } from "lucide-react";

const MetricCard = ({ icon: Icon, label, value, accent, delay }) => (
  <div
    className="card p-5 flex items-start justify-between gap-4 animate-fade-up"
    style={{ animationDelay: delay }}
  >
    <div>
      <p className="text-xs font-mono text-dim uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-3xl font-mono font-bold ${accent}`}>{value ?? "—"}</p>
    </div>
    <div className={`p-2.5 rounded-lg bg-current/10 ${accent}`}>
      <Icon size={18} />
    </div>
  </div>
);

const StatusBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-dim w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-text w-8 text-right">{count}</span>
    </div>
  );
};

const DashboardMetrics = ({ metrics }) => {
  const { totalTasks, totalProjects, tasksByStatus, overdueTasks } = metrics;

  return (
    <section>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={CheckSquare}
          label="Total Tasks"
          value={totalTasks}
          accent="text-text"
          delay="0ms"
        />
        <MetricCard
          icon={FolderOpen}
          label="Projects"
          value={totalProjects}
          accent="text-info"
          delay="60ms"
        />
        <MetricCard
          icon={Clock}
          label="In Progress"
          value={tasksByStatus?.IN_PROGRESS}
          accent="text-amber"
          delay="120ms"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Overdue"
          value={overdueTasks}
          accent={overdueTasks > 0 ? "text-danger" : "text-success"}
          delay="180ms"
        />
      </div>

      {/* Status breakdown bar chart */}
      <div className="card p-5 animate-fade-up" style={{ animationDelay: "240ms" }}>
        <p className="text-xs font-mono text-dim uppercase tracking-widest mb-4">
          Status Breakdown
        </p>
        <div className="space-y-3">
          <StatusBar
            label="Pending"
            count={tasksByStatus?.PENDING ?? 0}
            total={totalTasks}
            color="bg-dim"
          />
          <StatusBar
            label="In Progress"
            count={tasksByStatus?.IN_PROGRESS ?? 0}
            total={totalTasks}
            color="bg-amber"
          />
          <StatusBar
            label="Completed"
            count={tasksByStatus?.COMPLETED ?? 0}
            total={totalTasks}
            color="bg-success"
          />
        </div>
      </div>
    </section>
  );
};

export default DashboardMetrics;