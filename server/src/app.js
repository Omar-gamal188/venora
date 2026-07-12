import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { requestId } from "./middlewares/requestId.js";
import { sanitizeRequest } from "./middlewares/sanitize.js";
import { globalLimiter } from "./middlewares/rateLimiters.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { authRouter } from "./routes/authRoutes.js";
import { productsRouter } from "./routes/productRoutes.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { ApiError } from "./utils/ApiError.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  // Behind Nginx/ELB the client IP arrives via X-Forwarded-For.
  if (env.trustProxy) app.set("trust proxy", 1);

  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.id,
      autoLogging: { ignore: (req) => req.url.startsWith("/health") },
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
    }),
  );

  // Security headers. This is a JSON API — a strict CSP mostly hardens error pages.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'none'"],
          formAction: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" }, // images served to the SPA
      referrerPolicy: { policy: "no-referrer" },
      hsts: env.isProduction,
    }),
  );

  // CORS whitelist (server-to-server / curl requests carry no Origin → allowed).
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.allowedOrigins.includes(origin.replace(/\/$/, ""))) {
          return callback(null, true);
        }
        return callback(ApiError.forbidden("origin not allowed by CORS"));
      },
      credentials: true,
      maxAge: 600,
    }),
  );

  app.use(globalLimiter);
  app.use(express.json({ limit: env.jsonBodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: env.jsonBodyLimit }));
  app.use(cookieParser(env.cookieSecret));
  app.use(hpp());
  app.use(sanitizeRequest);
  app.use(compression());

  app.use(healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/products", productsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
