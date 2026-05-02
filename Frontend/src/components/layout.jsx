/**
 * Layout — persistent shell for all authenticated pages.
 * Includes the top navigation bar and main content area.
 */

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, LayoutDashboard, FolderKanban, ChevronRight } from "lucide-react";

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* ── Top Nav ─────────────────────────────────────── */}
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <span className="text-amber font-mono font-bold text-lg tracking-tighter">
              TTM
            </span>
            <ChevronRight size={12} className="text-dim" />
            <span className="text-dim text-xs font-mono tracking-wide uppercase">
              Task Manager
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {[
              { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { to: "/projects",  icon: FolderKanban,    label: "Projects"  },
            ].map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors
                   ${isActive
                     ? "bg-amber/10 text-amber"
                     : "text-dim hover:text-text hover:bg-white/5"}`
                }
              >
                <Icon size={13} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-mono text-text leading-none">{user?.name}</p>
              <p className="text-[10px] text-dim mt-0.5 font-mono">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded text-dim hover:text-danger hover:bg-danger/10 transition-colors"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;