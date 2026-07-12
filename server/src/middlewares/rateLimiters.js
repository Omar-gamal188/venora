import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import { env } from "../config/env.js";

const standardOptions = {
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "too many requests, please try again later" },
};

/** Global IP throttle for the whole API. */
export const globalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  ...standardOptions,
});

/** Strict limiter for credential endpoints (login/register/password flows). */
export const authLimiter = rateLimit({
  windowMs: env.rateLimit.authWindowMs,
  max: env.rateLimit.authMax,
  skipSuccessfulRequests: true,
  ...standardOptions,
});

/** Adds latency to repeated auth attempts before the hard limit kicks in. */
export const authSlowDown = slowDown({
  windowMs: env.rateLimit.authWindowMs,
  delayAfter: 5,
  delayMs: (hits) => Math.min((hits - 5) * 250, 5_000),
});
