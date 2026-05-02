/**
 * Centralized Axios Instance
 *
 * - baseURL points to the Express backend (env var in production)
 * - Request interceptor: reads JWT from localStorage and injects
 *   it as "Authorization: Bearer <token>" on every request
 * - Response interceptor: auto-logs out on 401 (expired / invalid token)
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15s — Railway cold-starts can be slow
});

// ── Request interceptor — attach JWT ────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ttm_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 globally ──────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and reload to /login
      localStorage.removeItem("ttm_token");
      localStorage.removeItem("ttm_user");
      // Use location.replace so the browser history is cleared
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

// ── Typed API helpers (keeps components clean) ──────────────────

export const authAPI = {
  register: (data)  => api.post("/auth/register", data),
  login:    (data)  => api.post("/auth/login",    data),
  me:       ()      => api.get("/auth/me"),
};

export const projectAPI = {
  getAll:   ()       => api.get("/projects"),
  getById:  (id)     => api.get(`/projects/${id}`),
  create:   (data)   => api.post("/projects", data),
  update:   (id, data) => api.patch(`/projects/${id}`, data),
  remove:   (id)     => api.delete(`/projects/${id}`),
};

export const taskAPI = {
  getByProject: (projectId)         => api.get(`/projects/${projectId}/tasks`),
  getById:      (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`),
  create:       (projectId, data)   => api.post(`/projects/${projectId}/tasks`, data),
  update:       (projectId, taskId, data) =>
                  api.patch(`/projects/${projectId}/tasks/${taskId}`, data),
  remove:       (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
};

export const dashboardAPI = {
  getMetrics: () => api.get("/dashboard"),
};

export const userAPI = {
  getAll: () => api.get("/users"),
};

export default api;