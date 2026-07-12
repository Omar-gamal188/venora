import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as authService from "../services/authService.js";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../middlewares/auth.js";

function parseDurationMs(value, fallbackMs) {
  const m = /^(\d+)([smhd])$/.exec(String(value || "").trim());
  if (!m) return fallbackMs;
  const mult = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2]];
  return Number(m[1]) * mult;
}

const baseCookie = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "strict",
};

/**
 * Sets httpOnly session cookies alongside the JSON token (legacy clients use
 * the token from the body; same-origin deployments can rely on cookies).
 * `rememberMe: false` makes them session cookies (cleared when browser closes).
 */
function setSessionCookies(res, { accessToken, refreshToken }, rememberMe = true) {
  const accessMs = parseDurationMs(env.jwtExpiresIn, 7 * 86_400_000);
  const refreshMs = env.refreshExpiresInDays * 86_400_000;
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookie,
    path: "/",
    ...(rememberMe ? { maxAge: accessMs } : {}),
  });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookie,
    path: "/api/auth",
    ...(rememberMe ? { maxAge: refreshMs } : {}),
  });
}

function clearSessionCookies(res) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { ...baseCookie, path: "/" });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { ...baseCookie, path: "/api/auth" });
}

/* ------------------------- legacy-shape endpoints ------------------------- */

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body, req);
  setSessionCookies(res, { accessToken, refreshToken });
  res.status(201).json({ message: "registered", token: accessToken, user });
});

export const login = asyncHandler(async (req, res) => {
  const { rememberMe, ...credentials } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(credentials, req);
  setSessionCookies(res, { accessToken, refreshToken }, rememberMe);
  res.json({ message: "ok", token: accessToken, user });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.userId);
  res.json({ user });
});

/* --------------------------- new auth endpoints --------------------------- */

export const refresh = asyncHandler(async (req, res) => {
  const presented = req.cookies?.[REFRESH_TOKEN_COOKIE] || req.body?.refreshToken;
  const { user, accessToken, refreshToken } = await authService.refresh(presented, req);
  setSessionCookies(res, { accessToken, refreshToken });
  res.json({
    success: true,
    message: "token refreshed",
    data: { token: accessToken, user },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const presented = req.cookies?.[REFRESH_TOKEN_COOKIE] || req.body?.refreshToken;
  await authService.logout(presented, req, req.userId ?? null);
  clearSessionCookies(res);
  res.json({ success: true, message: "logged out", data: null });
});

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.userId, req);
  clearSessionCookies(res);
  res.json({ success: true, message: "all sessions revoked", data: null });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.userId, req.body, req);
  clearSessionCookies(res);
  res.json({
    success: true,
    message: "password changed — please sign in again on other devices",
    data: null,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email, req);
  // Uniform response whether or not the email exists.
  res.json({
    success: true,
    message: "if that email is registered, a reset link has been sent",
    data: null,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body, req);
  res.json({ success: true, message: "password has been reset", data: null });
});

export const requestEmailVerification = asyncHandler(async (req, res) => {
  const { alreadyVerified } = await authService.requestEmailVerification(req.userId, req);
  res.json({
    success: true,
    message: alreadyVerified ? "email already verified" : "verification email sent",
    data: null,
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.confirmEmailVerification(req.body.token, req);
  res.json({ success: true, message: "email verified", data: null });
});
