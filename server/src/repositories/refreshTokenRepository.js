import { RefreshToken } from "../models/RefreshToken.js";

export const refreshTokenRepository = {
  create(data) {
    return RefreshToken.create(data);
  },

  findByTokenHash(tokenHash) {
    return RefreshToken.findOne({ tokenHash });
  },

  revokeByTokenHash(tokenHash, { replacedByHash = null } = {}) {
    return RefreshToken.updateOne(
      { tokenHash, revokedAt: null },
      { $set: { revokedAt: new Date(), replacedByHash } },
    );
  },

  /** Revoke every active session in a family (used on token-reuse detection). */
  revokeFamily(userId, family) {
    return RefreshToken.updateMany(
      { user: userId, family, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  },

  /** Revoke all sessions for a user (password change / global logout). */
  revokeAllForUser(userId) {
    return RefreshToken.updateMany(
      { user: userId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  },

  listActiveForUser(userId) {
    return RefreshToken.find({
      user: userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .select("family createdAt createdByIp userAgent expiresAt")
      .lean();
  },
};
