/**
 * Prisma Client Singleton
 *
 * We export a single PrismaClient instance to prevent
 * exhausting database connections in development (Next.js HMR problem,
 * but good practice here too).
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"] // verbose logging during dev
      : ["error"],                 // only errors in production
});

module.exports = prisma;