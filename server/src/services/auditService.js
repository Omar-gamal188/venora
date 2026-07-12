import { AuditLog } from "../models/AuditLog.js";
import { securityLogger } from "../config/logger.js";

/**
 * Writes security events to both the security log stream and the auditlogs
 * collection. Never throws — auditing must not break the request path.
 */
export async function audit(event, outcome, req, { user, username, details } = {}) {
  const entry = {
    event,
    outcome,
    user: user ?? null,
    username: username ?? "",
    ip: req?.ip ?? "",
    userAgent: req?.headers?.["user-agent"]?.slice(0, 512) ?? "",
    requestId: req?.id ?? "",
    details: details ?? {},
  };
  securityLogger.info(entry, `audit:${event}:${outcome}`);
  try {
    await AuditLog.create(entry);
  } catch (err) {
    securityLogger.error({ err }, "failed to persist audit log entry");
  }
}
