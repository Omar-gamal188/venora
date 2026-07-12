import { User } from "../models/User.js";

const CI_COLLATION = { locale: "en", strength: 2 };
const AUTH_FIELDS = "+passwordHash +failedLoginAttempts +lockUntil";

export const userRepository = {
  findById(id) {
    return User.findById(id);
  },

  /** Case-insensitive username lookup (uses the collation index). */
  findByUsername(username, { withAuthFields = false } = {}) {
    const q = User.findOne({ username: String(username || "").trim() }).collation(
      CI_COLLATION,
    );
    return withAuthFields ? q.select(AUTH_FIELDS) : q;
  },

  findByEmail(email, { withAuthFields = false } = {}) {
    const q = User.findOne({ email: String(email || "").trim().toLowerCase() });
    return withAuthFields ? q.select(AUTH_FIELDS) : q;
  },

  findByIdWithPassword(id) {
    return User.findById(id).select(AUTH_FIELDS);
  },

  findByResetTokenHash(tokenHash) {
    return User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpiresAt +passwordHash");
  },

  findByEmailVerificationTokenHash(tokenHash) {
    return User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
    }).select("+emailVerificationTokenHash +emailVerificationExpiresAt");
  },

  create(data) {
    return User.create(data);
  },

  /** Atomic update that skips document validators (safe for legacy documents). */
  updateById(id, update) {
    return User.updateOne({ _id: id }, update);
  },

  registerFailedLogin(id, { lockUntil = null } = {}) {
    const update = { $inc: { failedLoginAttempts: 1 } };
    if (lockUntil) update.$set = { lockUntil };
    return User.updateOne({ _id: id }, update);
  },

  registerSuccessfulLogin(id) {
    return User.updateOne(
      { _id: id },
      { $set: { failedLoginAttempts: 0, lockUntil: null, lastLoginAt: new Date() } },
    );
  },
};
