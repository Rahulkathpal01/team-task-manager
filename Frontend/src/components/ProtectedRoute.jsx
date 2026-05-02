/**
 * ProtectedRoute
 * Redirects unauthenticated users to /login.
 * Optionally restricts to a specific role (e.g. "ADMIN").
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ requiredRole }) => {
  const { user, token } = useAuth();

  // No token → send to login
  if (!token || !user) return <Navigate to="/login" replace />;

  // Role gate (optional)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;