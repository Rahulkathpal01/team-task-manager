require("dotenv").config(); // 1. Load env vars first
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// 2. Import Routes
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const userRoutes = require("./routes/user.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();
const PORT = process.env.PORT || 5000;

// 3. Global Middleware
app.use(helmet());
// backend/src/server.js — replace the cors() call

app.use(cors({
  // Allow Railway wildcard OR your specific Vercel URL
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const allowed = [
      process.env.CLIENT_URL,           // e.g. https://ttm.vercel.app
      /\.vercel\.app$/,                 // any Vercel preview URL
      /\.up\.railway\.app$/,            // any Railway URL
      "http://localhost:5173",          // local dev
      "http://localhost:3000",
    ].filter(Boolean);

    const isAllowed = allowed.some((pattern) =>
      pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 5. Mount API Routers
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// 6. Error Handling (Must be last)
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});
app.use(errorHandler);

// 7. Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
