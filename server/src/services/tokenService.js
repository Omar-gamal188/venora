import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { generateOpaqueToken, sha256 } from "../utils/tokens.js";
import { refreshTokenRepository } from "../repositories/refreshTokenRepository.js";

export function signAccessToken(userId, role = "user") {
  return jwt.sign({ sub: String(userId), role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    issuer: "ecommerce-api",
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret, { issuer: "ecommerce-api" });
}

function refreshExpiryDate() {
  return new Date(Date.now() + env.refreshExpiresInDays * 24 * 60 * 60 * 1000);
}

/** Issues a brand-new refresh session (login/register). One family per device. */
export async function issueRefreshToken(userId, req, { family } = {}) {
  const token = generateOpaqueToken();
  await refreshTokenRepository.create({
    user: userId,
    tokenHash: sha256(token),
    family: family || randomUUID(),
    expiresAt: refreshExpiryDate(),
    createdByIp: req?.ip ?? "",
    userAgent: req?.headers?.["user-agent"]?.slice(0, 512) ?? "",
  });
  return token;
}

/**
 * Rotation with reuse detection: a valid token is exchanged exactly once.
 * Presenting an already-rotated/revoked token nukes the whole session family.
 */
export async function rotateRefreshToken(presentedToken, req) {
  const tokenHash = sha256(String(presentedToken || ""));
  const doc = await refreshTokenRepository.findByTokenHash(tokenHash);

  if (!doc) throw ApiError.unauthorized("invalid refresh token");

  if (doc.revokedAt || doc.expiresAt <= new Date()) {
    // Reuse of a rotated token → assume theft, revoke the entire family.
    await refreshTokenRepository.revokeFamily(doc.user, doc.family);
    throw ApiError.unauthorized("refresh token expired or reused");
  }

  const newToken = generateOpaqueToken();
  await refreshTokenRepository.create({
    user: doc.user,
    tokenHash: sha256(newToken),
    family: doc.family,
    expiresAt: refreshExpiryDate(),
    createdByIp: req?.ip ?? "",
    userAgent: req?.headers?.["user-agent"]?.slice(0, 512) ?? "",
  });
  await refreshTokenRepository.revokeByTokenHash(tokenHash, {
    replacedByHash: sha256(newToken),
  });

  return { userId: doc.user, token: newToken };
}

export async function revokeRefreshToken(presentedToken) {
  if (!presentedToken) return;
  await refreshTokenRepository.revokeByTokenHash(sha256(String(presentedToken)));
}

export async function revokeAllSessions(userId) {
  await refreshTokenRepository.revokeAllForUser(userId);
}

export function listSessions(userId) {
  return refreshTokenRepository.listActiveForUser(userId);
}
