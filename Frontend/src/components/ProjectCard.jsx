/**
 * ProjectCard
 * Compact card displaying a project's summary.
 * Clicking navigates to the full project detail page.
 */

import { Link } from "react-router-dom";
import { FolderKanban, ArrowRight, Trash2 } from "lucide-react";
import { projectAPI } from "../api/api";
import { useState } from "react";

const ProjectCard = ({ project, isAdmin, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault(); // don't navigate via Link
    e.stopPropagation();
    if (!window.confirm(`Delete project "${project.name}"? All tasks will be deleted too.`)) return;
    setDeleting(true);
    try {
      await projectAPI.remove(project.id);
      onDelete?.(project.id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Link
      to={`/projects/${project.id}`}
      className="card p-5 flex flex-col gap-3 group hover:border-amber/30
                 transition-all duration-200 animate-fade-up block"
    >
      {/* Icon + title */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-amber/10 rounded text-amber shrink-0">
            <FolderKanban size={14} />
          </div>
          <div className="min-w-0">
            <h3 className="font-mono font-bold text-text text-sm truncate
                           group-hover:text-amber transition-colors">
              {project.name}
            </h3>
            <p className="text-[11px] text-dim font-mono mt-0.5">
              by {project.createdBy?.name}
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 text-dim hover:text-danger hover:bg-danger/10 rounded
                       opacity-0 group-hover:opacity-100 transition-all shrink-0"
            title="Delete project"
          >
            {deleting
              ? <span className="w-3 h-3 border border-danger border-t-transparent rounded-full animate-spin block" />
              : <Trash2 size={13} />
            }
          </button>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-dim leading-relaxed line-clamp-2">{project.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-[11px] font-mono text-dim bg-border/40 px-2 py-0.5 rounded">
          {project._count?.tasks ?? 0} tasks
        </span>
        <ArrowRight
          size={13}
          className="text-dim group-hover:text-amber group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </Link>
  );
};

export default ProjectCard;