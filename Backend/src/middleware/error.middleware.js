/**
 * Global Error Handler
 * Must be registered LAST in server.js (after all routes).
 * Catches any error passed via next(error).
 */

const errorHandler = (err, req, res, next) => {
  // Log the full error server-side for debugging
  console.error(`[ERROR] ${err.message}`, err.stack);

  // Prisma-specific errors
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A record with this value already exists.",
    });
  }

  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected server error occurred.",
    // Only expose stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;