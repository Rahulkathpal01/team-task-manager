/**
 * App.jsx — Root router
 *
 * Route tree:
 *   /              → redirect to /dashboard
 *   /login         → Login page (public only)
 *   /register      → Register page (public only)
 *   /dashboard     → Dashboard (protected)
 *   /projects      → Project list (protected)
 *   /projects/:id  → Project detail + tasks (protected)
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";



// Pages (lazy-loaded for performance)
import { lazy, Suspense } from "react";

const Login     = lazy(() => import("./pages/Login"));
const Register  = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects  = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));

const Spinner = () => (
  <div className="min-h-screen bg-canvas flex items-center justify-center">
    <div className="w-5 h-5 border-2 border-amber border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <AuthProvider>
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

       {/* Public routes — accessible to everyone for now */}
<Route path="/login"    element={<Login />} />
<Route path="/register" element={<Register />} />

        {/* Protected routes — accessible directly for now */}
<Route path="/dashboard"    element={<Dashboard />} />
<Route path="/projects"     element={<Projects />} />
<Route path="/projects/:id" element={<ProjectDetail />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  </AuthProvider>
);

export default App;
