require("dotenv").config(); // 1. Load env vars first

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Import Routes
const authRoutes      = require("./routes/auth.routes");
const projectRoutes   = require("./routes/project.routes");
const taskRoutes      = require("./routes/task.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const userRoutes      = require("./routes/user.routes");
const errorHandler    = require("./middleware/error.middleware");

const app = express(); // 2. Create the app BEFORE using it
const PORT = process.env.PORT || 5000;

// 3. Global Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 5. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// 6. 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// 7. Global Error Handler (must be last)
app.use(errorHandler);

// 8. Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});