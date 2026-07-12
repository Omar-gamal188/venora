import { randomUUID } from "node:crypto";

/** Attaches a unique id to every request and exposes it to clients/logs. */
export function requestId(req, res, next) {
  const incoming = req.headers["x-request-id"];
  req.id =
    typeof incoming === "string" && /^[\w.-]{8,64}$/.test(incoming)
      ? incoming
      : randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
}
