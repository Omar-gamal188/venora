import http from "node:http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDb, disconnectDb } from "./config/db.js";
import { createApp } from "./app.js";
import { seedDashboardAdminIfEnabled } from "./scripts/seedDashboardAdmin.js";

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "unhandled promise rejection");
  throw reason instanceof Error ? reason : new Error(String(reason));
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaught exception — shutting down");
  process.exit(1);
});

async function main() {
  await connectDb();
  await seedDashboardAdminIfEnabled();

  const app = createApp();
  const server = http.createServer(app);
  // Keep-alive tuning: must exceed the LB's idle timeout to avoid 502s.
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

  server.listen(env.port, () => {
    logger.info(
      { port: env.port, env: env.nodeEnv, origins: env.allowedOrigins },
      `API listening on port ${env.port}`,
    );
  });

  let shuttingDown = false;
  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "graceful shutdown started");

    const forceExit = setTimeout(() => {
      logger.error("shutdown timed out — forcing exit");
      process.exit(1);
    }, 15_000);
    forceExit.unref();

    server.close(async (err) => {
      if (err) logger.error({ err }, "error closing HTTP server");
      try {
        await disconnectDb();
        logger.info("shutdown complete");
        process.exit(err ? 1 : 0);
      } catch (dbErr) {
        logger.error({ err: dbErr }, "error closing MongoDB connection");
        process.exit(1);
      }
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  logger.fatal({ err }, "failed to start server");
  process.exit(1);
});
