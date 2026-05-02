/**
 * AuthContext
 *
 * Single source of truth for authentication state.
 * Persists { token, user } to localStorage so the session
 * survives page refreshes.
 *
 * Provides:
 *   user    — current user object or null
 *   token   — JWT string or null
 *   login() — stores credentials after successful API call
 *   logout()— clears everything and redirects to /login
 */

import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Rehydrate from localStorage on mount
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("ttm_user")); }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("ttm_token"));

  const navigate = useNavigate();

  /** Call this after a successful /login or /register response */
  const login = useCallback((userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem("ttm_user",  JSON.stringify(userData));
    localStorage.setItem("ttm_token", jwt);
  }, []);

  /** Wipes state + storage, sends user to login */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("ttm_user");
    localStorage.removeItem("ttm_token");
    navigate("/login");
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin: user?.role === "ADMIN" }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Convenience hook — throws if used outside AuthProvider */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};