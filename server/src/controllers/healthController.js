import { isDbReady } from "../config/db.js";

/** Legacy shape — kept for anything already polling /health. */
export function health(_req, res) {
  res.json({ ok: true });
}

/** Liveness: the process is up and the event loop responds. */
export function live(_req, res) {
  res.json({ success: true, message: "alive", data: { uptime: process.uptime() } });
}

/** Readiness: dependencies (MongoDB) are reachable — safe to route traffic. */
export function ready(_req, res) {
  const dbReady = isDbReady();
  res.status(dbReady ? 200 : 503).json({
    success: dbReady,
    message: dbReady ? "ready" : "database unavailable",
    data: { db: dbReady ? "connected" : "disconnected" },
  });
}
