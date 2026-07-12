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

const baseOptions = {
  level: env.logLevel,
  redact: { paths: redactPaths, censor: "[REDACTED]" },
  base: { service: "ecommerce-api", env: env.nodeEnv },
  timestamp: pino.stdTimeFunctions.isoTime,
};

// Serverless platforms (Vercel/Lambda): read-only filesystem and no worker
// threads for pino transports — log straight to stdout, the platform
// collects it. File logging only applies to real servers (VPS/Docker/PM2).
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

function createLogger() {
  if (isServerless) return pino(baseOptions);

  const targets = [
    {
      // console output (collected by Docker/PM2)
      target: "pino/file",
      level: env.logLevel,
      options: { destination: 1 },
    },
  ];
  try {
    const logDir = path.resolve(process.cwd(), env.logDir);
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
  return pino({ ...baseOptions, transport: { targets } });
}

export const logger = createLogger();

/** Dedicated security/audit trail (auth events, permission denials, lockouts). */
export const securityLogger = logger.child({ channel: "security" });
