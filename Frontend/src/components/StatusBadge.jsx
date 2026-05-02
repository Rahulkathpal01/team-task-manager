/**
 * StatusBadge
 * Renders a styled pill for task status values.
 * Used in both the task table and metric cards.
 */

const STATUS_CONFIG = {
  PENDING:     { label: "Pending",     cls: "badge-pending"     },
  IN_PROGRESS: { label: "In Progress", cls: "badge-in_progress" },
  COMPLETED:   { label: "Completed",   cls: "badge-completed"   },
  OVERDUE:     { label: "Overdue",     cls: "badge-overdue"     },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return <span className={config.cls}>{config.label}</span>;
};

export default StatusBadge;