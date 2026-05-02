/**
 * Team Task Manager — Express Server
 *
 * Startup order:
 *  1. Load env vars
 *  2. Configure Express + global middleware
 *  3. Mount API routers
 *  4. Global error handler (must be last)
 *  5. Start listening
 */
// ── replace the existing route section in server.js with this ──

const authRoutes      = require("./routes/auth.routes");
const projectRoutes   = require("./routes/project.routes");
const taskRoutes      = require("./routes/task.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const userRoutes      = require("./routes/user.routes");

// Mount routers
app.use("/api/auth",      authRoutes);
app.use("/api/projects",  projectRoutes);

// Nested tasks under projects: /api/projects/:projectId/tasks
app.use("/api/projects/:projectId/tasks", taskRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users",     userRoutes);

require("dotenv").config(); // Load .env before anything else

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & Utility Middleware ─────────────────────────────

app.use(helmet());           // Sets security-related HTTP headers
app.use(cors({
  // In production, replace "*" with your Railway frontend URL
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));
app.use(morgan("dev"));      // HTTP request logger
app.use(express.json());     // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────
// Railway uses this to verify the service is running
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
// Phase 2 — will add:
// app.use("/api/projects", projectRoutes);
// app.use("/api/tasks", taskRoutes);
// app.use("/api/dashboard", dashboardRoutes);

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global Error Handler (must be last) ───────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});