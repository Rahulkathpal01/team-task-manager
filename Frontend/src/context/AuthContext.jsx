import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("ttm_user")); }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("ttm_token"));

  const navigate = useNavigate();

  /**
   * Called after a successful /login response.
   * Persists credentials AND navigates to dashboard.
   */
  const login = useCallback((userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem("ttm_user",  JSON.stringify(userData));
    localStorage.setItem("ttm_token", jwt);
    // ✅ Always navigate to dashboard after login
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("ttm_user");
    localStorage.removeItem("ttm_token");
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin: user?.role === "ADMIN" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
