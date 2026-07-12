import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateOpaqueToken, sha256 } from "../utils/tokens.js";
import { userRepository } from "../repositories/userRepository.js";
import {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllSessions,
} from "./tokenService.js";
import { audit } from "./auditService.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "./emailService.js";

const GENERIC_LOGIN_ERROR = "invalid username or password";

export function normalizeName(s) {
  return String(s || "").trim().toLowerCase();
}

/** Usernames that count as admin via env (legacy behavior, kept for compat). */
export function envAdminUsernamesSet() {
  const set = new Set();
  const primary = normalizeName(env.dashboardAdmin.username);
  if (primary) set.add(primary);
  env.dashboardAdmin.extraUsernames.split(",").forEach((part) => {
    const x = normalizeName(part);
    if (x) set.add(x);
  });
  return set;
}

export function resolveUserRole(u) {
  if (!u) return "user";
  if (u.role === "admin") return "admin";
  if (envAdminUsernamesSet().has(normalizeName(u.username))) return "admin";
  return "user";
}

/** Exact legacy response shape — the frontend depends on these keys. */
export function userResponse(userDoc) {
  const u = typeof userDoc.toJSON === "function" ? userDoc.toJSON() : userDoc;
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone,
    address: u.address,
    role: resolveUserRole(u),
    createdAt: u.createdAt,
  };
}

async function issueSessionTokens(user, req) {
  const role = resolveUserRole(user);
  const accessToken = signAccessToken(user._id, role);
  const refreshToken = await issueRefreshToken(user._id, req);
  return { accessToken, refreshToken };
}

export async function register(input, req) {
  const { username, password, email, fullName, phone = "", address = "" } = input;
  const emailNorm = normalizeName(email);

  const [existingUser, existingEmail] = await Promise.all([
    userRepository.findByUsername(username),
    userRepository.findByEmail(emailNorm),
  ]);
  if (existingUser) throw ApiError.conflict("username already taken");
  if (existingEmail) throw ApiError.conflict("email already registered");
  if (envAdminUsernamesSet().has(normalizeName(username))) {
    throw ApiError.forbidden("this username is reserved");
  }

  const passwordHash = await hashPassword(password);
  const user = await userRepository.create({
    username: username.trim(),
    email: emailNorm,
    fullName: fullName.trim(),
    phone: phone.trim(),
    address: address.trim(),
    passwordHash,
    role: "user",
  });

  await audit("auth.register", "success", req, {
    user: user._id,
    username: user.username,
  });

  const tokens = await issueSessionTokens(user, req);
  return { user: userResponse(user), ...tokens };
}

export async function login({ username, password }, req) {
  const user = await userRepository.findByUsername(username, { withAuthFields: true });

  if (!user || user.isActive === false) {
    await audit("auth.login", "failure", req, {
      username,
      details: { reason: user ? "inactive" : "unknown_user" },
    });
    throw ApiError.unauthorized(GENERIC_LOGIN_ERROR);
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    await audit("auth.login", "failure", req, {
      user: user._id,
      username: user.username,
      details: { reason: "locked" },
    });
    throw ApiError.tooMany(
      "account temporarily locked after too many failed attempts — try again later",
    );
  }

  const { valid, needsRehash } = await verifyPassword(user.passwordHash, password);

  if (!valid) {
    const attempts = (user.failedLoginAttempts || 0) + 1;
    const shouldLock = attempts >= env.accountLock.maxFailedAttempts;
    await userRepository.registerFailedLogin(user._id, {
      lockUntil: shouldLock
        ? new Date(Date.now() + env.accountLock.lockMinutes * 60 * 1000)
        : null,
    });
    await audit("auth.login", "failure", req, {
      user: user._id,
      username: user.username,
      details: { reason: "bad_password", attempts, locked: shouldLock },
    });
    if (shouldLock) {
      throw ApiError.tooMany(
        "account temporarily locked after too many failed attempts — try again later",
      );
    }
    throw ApiError.unauthorized(GENERIC_LOGIN_ERROR);
  }

  // Transparent bcrypt → argon2 migration (and argon2 parameter upgrades).
  if (needsRehash) {
    const newHash = await hashPassword(password);
    await userRepository.updateById(user._id, { $set: { passwordHash: newHash } });
  }
  await userRepository.registerSuccessfulLogin(user._id);
  await audit("auth.login", "success", req, { user: user._id, username: user.username });

  const tokens = await issueSessionTokens(user, req);
  return { user: userResponse(user), ...tokens };
}

export async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user || user.isActive === false) throw ApiError.unauthorized("user not found");
  return userResponse(user);
}

export async function refresh(presentedToken, req) {
  if (!presentedToken) throw ApiError.unauthorized("missing refresh token");
  const { userId, token } = await rotateRefreshToken(presentedToken, req);
  const user = await userRepository.findById(userId);
  if (!user || user.isActive === false) throw ApiError.unauthorized("user not found");
  await audit("auth.refresh", "success", req, { user: user._id, username: user.username });
  return {
    user: userResponse(user),
    accessToken: signAccessToken(user._id, resolveUserRole(user)),
    refreshToken: token,
  };
}

export async function logout(presentedToken, req, userId = null) {
  await revokeRefreshToken(presentedToken);
  await audit("auth.logout", "success", req, { user: userId });
}

export async function logoutAll(userId, req) {
  await revokeAllSessions(userId);
  await audit("auth.logout_all", "success", req, { user: userId });
}

export async function changePassword(userId, { currentPassword, newPassword }, req) {
  const user = await userRepository.findByIdWithPassword(userId);
  if (!user) throw ApiError.unauthorized("user not found");

  const { valid } = await verifyPassword(user.passwordHash, currentPassword);
  if (!valid) {
    await audit("auth.password_change", "failure", req, {
      user: user._id,
      username: user.username,
    });
    throw ApiError.unauthorized("current password is incorrect");
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepository.updateById(user._id, {
    $set: { passwordHash, passwordChangedAt: new Date() },
  });
  // Invalidate every session — the client must log in again on other devices.
  await revokeAllSessions(user._id);
  await audit("auth.password_change", "success", req, {
    user: user._id,
    username: user.username,
  });
}

export async function forgotPassword(email, req) {
  const user = await userRepository.findByEmail(email);
  // Always report success — never reveal whether an email exists.
  if (!user) {
    await audit("auth.forgot_password", "failure", req, {
      details: { reason: "unknown_email" },
    });
    return;
  }
  const token = generateOpaqueToken();
  await userRepository.updateById(user._id, {
    $set: {
      passwordResetTokenHash: sha256(token),
      passwordResetExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });
  const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, resetUrl);
  await audit("auth.forgot_password", "success", req, {
    user: user._id,
    username: user.username,
  });
}

export async function resetPassword({ token, newPassword }, req) {
  const user = await userRepository.findByResetTokenHash(sha256(String(token || "")));
  if (!user) {
    await audit("auth.reset_password", "failure", req, {
      details: { reason: "invalid_or_expired_token" },
    });
    throw ApiError.badRequest("invalid or expired reset token");
  }
  const passwordHash = await hashPassword(newPassword);
  await userRepository.updateById(user._id, {
    $set: {
      passwordHash,
      passwordChangedAt: new Date(),
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      failedLoginAttempts: 0,
      lockUntil: null,
    },
  });
  await revokeAllSessions(user._id);
  await audit("auth.reset_password", "success", req, {
    user: user._id,
    username: user.username,
  });
}

export async function requestEmailVerification(userId, req) {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.unauthorized("user not found");
  if (user.isEmailVerified) return { alreadyVerified: true };

  const token = generateOpaqueToken();
  await userRepository.updateById(user._id, {
    $set: {
      emailVerificationTokenHash: sha256(token),
      emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  const verifyUrl = `${env.clientUrl}/verify-email?token=${token}`;
  await sendVerificationEmail(user.email, verifyUrl);
  await audit("auth.verify_email_request", "success", req, { user: user._id });
  return { alreadyVerified: false };
}

export async function confirmEmailVerification(token, req) {
  const user = await userRepository.findByEmailVerificationTokenHash(
    sha256(String(token || "")),
  );
  if (!user) throw ApiError.badRequest("invalid or expired verification token");
  await userRepository.updateById(user._id, {
    $set: {
      isEmailVerified: true,
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    },
  });
  await audit("auth.verify_email", "success", req, { user: user._id });
}
