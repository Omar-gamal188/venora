import fs from "node:fs";
import path from "node:path";
import pino from "pino";
import { env } from "./env.js";

const redactPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "res.headers['set-cookie']",
  "*.password",
  "*.passwordHash",
  "*.token",
  "*.refreshToken",
];

// Serverless platforms (Vercel/Lambda) have a read-only filesystem and
// collect stdout themselves — file logging only applies to real servers.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

const targets = [
  {
    // console output (collected by Docker/PM2/Vercel)
    target: "pino/file",
    level: env.logLevel,
    options: { destination: 1 },
  },
];

if (!isServerless) {
  const logDir = path.resolve(process.cwd(), env.logDir);
  try {
    fs.mkdirSync(logDir, { recursive: true });
    targets.push(
      {
        target: "pino/file",
        level: env.logLevel,
        options: { destination: path.join(logDir, "app.log"), mkdir: true },
      },
      {
        target: "pino/file",
        level: "error",
        options: { destination: path.join(logDir, "error.log"), mkdir: true },
      },
    );
  } catch {
    // Log directory not writable — stdout-only logging still works.
  }
}

export const logger = pino({
  level: env.logLevel,
  redact: { paths: redactPaths, censor: "[REDACTED]" },
  base: { service: "ecommerce-api", env: env.nodeEnv },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: { targets },
});

/** Dedicated security/audit trail (auth events, permission denials, lockouts). */
export const securityLogger = logger.child({ channel: "security" });
