import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../services/tokenService.js";
import { env } from "../config/env.js";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

function extractToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return { token: header.slice(7), via: "header" };
  }
  const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (cookieToken) return { token: cookieToken, via: "cookie" };
  return { token: null, via: null };
}

/**
 * Cookie-authenticated state-changing requests must come from an allowed
 * origin (CSRF defense). Bearer-authenticated requests are immune to CSRF —
 * an attacker's page can't read localStorage to set the header.
 */
function assertOriginAllowed(req) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const source = req.headers.origin || req.headers.referer;
  if (!source) throw ApiError.forbidden("missing origin");
  let origin;
  try {
    origin = new URL(source).origin;
  } catch {
    throw ApiError.forbidden("invalid origin");
  }
  if (!env.allowedOrigins.includes(origin)) {
    throw ApiError.forbidden("origin not allowed");
  }
}

export function requireAuth(req, _res, next) {
  const { token, via } = extractToken(req);
  if (!token) return next(ApiError.unauthorized());
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.userRole = payload.role || "user";
    req.authVia = via;
  } catch {
    return next(ApiError.unauthorized("invalid or expired token"));
  }
  if (via === "cookie") {
    try {
      assertOriginAllowed(req);
    } catch (err) {
      return next(err);
    }
  }
  next();
}

/** Attaches identity when present; never rejects. */
export function optionalAuth(req, _res, next) {
  const { token, via } = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.userRole = payload.role || "user";
    req.authVia = via;
  } catch {
    // anonymous
  }
  next();
}
