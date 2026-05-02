/**
 * Projects Page (/projects)
 * A dedicated projects browse page separate from the dashboard.
 * ADMIN can create + delete. All users can browse and click through.
 */

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import Layout             from "../components/layout";
import ProjectCard        from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";
import { useAuth }        from "../context/AuthContext";
import { projectAPI }     from "../api/api";

const Projects = () => {
  const { isAdmin } = useAuth();

  const [projects,  setProjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [search,    setSearch]    = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await projectAPI.getAll();
      setProjects(data.data);
    } catch {
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, []);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="font-mono font-bold text-2xl text-text tracking-tight">Projects</h1>
          <p className="text-sm text-dim mt-1">
            {isAdmin ? "Manage all team projects" : "Projects you're assigned to"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={14} /> New Project
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative mb-6 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects…"
          className="field pl-8"
        />
      </div>

      {/* States */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-amber" />
        </div>
      ) : error ? (
        <div className="card py-10 text-center">
          <p className="text-danger text-sm font-mono">{error}</p>
          <button onClick={fetch} className="btn-ghost mt-4 text-xs">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-14 text-center">
          <p className="text-dim text-sm font-mono">
            {search ? `No projects matching "${search}"` : "No projects found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => (
            <div key={project.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <ProjectCard
                project={project}
                isAdmin={isAdmin}
                onDelete={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))}
              />
            </div>
          ))}
        </div>
      )}

      <CreateProjectModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(newProject) => setProjects((prev) => [newProject, ...prev])}
      />
    </Layout>
  );
};

export default Projects;
