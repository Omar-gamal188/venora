import "dotenv/config";
import crypto from "node:crypto";

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

function required(name, fallbackForDev) {
  const value = process.env[name];
  if (value && value.trim()) return value.trim();
  if (!isProduction && fallbackForDev !== undefined) return fallbackForDev;
  throw new Error(
    `Missing required environment variable ${name}. Refusing to start in production without it.`,
  );
}

function optional(name, fallback) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

function intOf(name, fallback) {
  const n = Number(optional(name, fallback));
  return Number.isFinite(n) ? n : fallback;
}

function boolOf(name, fallback = false) {
  const v = optional(name, String(fallback));
  return v === "true" || v === "1";
}

// In development only, generate ephemeral secrets so the app boots without a .env,
// but warn loudly — sessions won't survive a restart.
function devSecret(name) {
  const generated = crypto.randomBytes(48).toString("hex");
  // eslint-disable-next-line no-console
  console.warn(
    `[env] ${name} is not set — using a random ephemeral secret (development only).`,
  );
  return generated;
}

const jwtSecret = isProduction
  ? required("JWT_SECRET")
  : optional("JWT_SECRET") || devSecret("JWT_SECRET");
const jwtRefreshSecret = isProduction
  ? required("JWT_REFRESH_SECRET")
  : optional("JWT_REFRESH_SECRET") || devSecret("JWT_REFRESH_SECRET");
const cookieSecret = isProduction
  ? required("COOKIE_SECRET")
  : optional("COOKIE_SECRET") || devSecret("COOKIE_SECRET");

if (isProduction) {
  const weak = ["your-secret-key", "dev-only-change-me", "changeme", "secret"];
  for (const [name, value] of [
    ["JWT_SECRET", jwtSecret],
    ["JWT_REFRESH_SECRET", jwtRefreshSecret],
    ["COOKIE_SECRET", cookieSecret],
  ]) {
    if (weak.includes(value.toLowerCase()) || value.length < 32) {
      throw new Error(
        `${name} is too weak for production (min 32 chars, not a known placeholder).`,
      );
    }
  }
  if (jwtSecret === jwtRefreshSecret) {
    throw new Error("JWT_SECRET and JWT_REFRESH_SECRET must be different.");
  }
}

const allowedOrigins = optional("ALLOWED_ORIGINS", "")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

const clientUrl = optional("CLIENT_URL", "http://localhost:5173").replace(/\/$/, "");
if (clientUrl && !allowedOrigins.includes(clientUrl)) {
  allowedOrigins.push(clientUrl);
}
if (!isProduction) {
  for (const origin of ["http://localhost:5173", "http://127.0.0.1:5173"]) {
    if (!allowedOrigins.includes(origin)) allowedOrigins.push(origin);
  }
}

export const env = {
  nodeEnv: NODE_ENV,
  isProduction,
  isDevelopment: !isProduction,
  port: intOf("PORT", 5000),
  mongodbUri: isProduction
    ? required("MONGODB_URI")
    : optional("MONGODB_URI", "mongodb://127.0.0.1:27017/ecommerce"),

  jwtSecret,
  jwtRefreshSecret,
  cookieSecret,
  jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),
  refreshExpiresInDays: intOf("REFRESH_TOKEN_DAYS", 30),

  clientUrl,
  allowedOrigins,

  jsonBodyLimit: optional("JSON_BODY_LIMIT", "10mb"),
  maxImageDataUrlBytes: intOf("MAX_IMAGE_DATA_URL_BYTES", 5 * 1024 * 1024),

  trustProxy: boolOf("TRUST_PROXY", isProduction),

  rateLimit: {
    windowMs: intOf("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
    max: intOf("RATE_LIMIT_MAX", 300),
    authWindowMs: intOf("AUTH_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
    authMax: intOf("AUTH_RATE_LIMIT_MAX", 20),
  },
  accountLock: {
    maxFailedAttempts: intOf("MAX_FAILED_LOGIN_ATTEMPTS", 5),
    lockMinutes: intOf("ACCOUNT_LOCK_MINUTES", 15),
  },

  logLevel: optional("LOG_LEVEL", isProduction ? "info" : "debug"),
  logDir: optional("LOG_DIR", "logs"),

  dashboardAdmin: {
    // No hardcoded default — admin rights come from DB roles unless configured.
    username: optional("DASHBOARD_ADMIN_USERNAME", ""),
    extraUsernames: optional("DASHBOARD_ADMIN_USERNAMES", ""),
    seedEnabled: boolOf("SEED_DASHBOARD_ADMIN", false),
    seedPassword: optional("DASHBOARD_ADMIN_PASSWORD", ""),
    seedEmail: optional("DASHBOARD_ADMIN_EMAIL", ""),
    seedFullName: optional("DASHBOARD_ADMIN_FULLNAME", "Dashboard Admin"),
    updateExistingPassword: boolOf("UPDATE_EXISTING_ADMIN_PASSWORD", false),
  },

  email: {
    host: optional("EMAIL_HOST", ""),
    port: intOf("EMAIL_PORT", 587),
    secure: boolOf("EMAIL_SECURE", false),
    user: optional("EMAIL_USER", ""),
    pass: optional("EMAIL_PASS", ""),
    from: optional("EMAIL_FROM", "Venora <no-reply@venora.local>"),
  },
};
