import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`route not found: ${req.method} ${req.originalUrl}`));
}

/** Central error handler — the only place that turns errors into responses. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let statusCode = 500;
  let message = "server error";
  let errors;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err?.name === "CastError") {
    statusCode = 404;
    message = "not found";
  } else if (err?.name === "ValidationError") {
    statusCode = 400;
    message = "validation failed";
    errors = Object.values(err.errors ?? {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern ?? {})[0] ?? "value";
    message = `${field} already exists`;
  } else if (err?.type === "entity.too.large") {
    statusCode = 413;
    message = "request body too large";
  } else if (err?.type === "entity.parse.failed") {
    statusCode = 400;
    message = "invalid JSON body";
  }

  const logPayload = {
    err,
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    userId: req.userId,
  };
  if (statusCode >= 500) logger.error(logPayload, "unhandled request error");
  else logger.warn({ ...logPayload, err: undefined, message }, "request rejected");

  const body = { message, requestId: req.id };
  if (errors) body.errors = errors;
  // Never leak stack traces or internals in production.
  if (env.isDevelopment && statusCode >= 500 && err?.stack) {
    body.stack = err.stack;
  }
  res.status(statusCode).json(body);
}
