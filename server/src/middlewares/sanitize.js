/**
 * MongoDB operator-injection protection: recursively removes keys starting
 * with `$` or containing `.` from body/params/query objects, and strips NUL
 * bytes from strings. (Structure-level defense; Zod validation then enforces
 * the exact expected shape and types.)
 */
function cleanValue(value) {
  if (typeof value === "string") return value.replace(/\0/g, "");
  if (Array.isArray(value)) return value.map(cleanValue);
  if (value && typeof value === "object" && value.constructor === Object) {
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      out[key] = cleanValue(v);
    }
    return out;
  }
  return value;
}

export function sanitizeRequest(req, _res, next) {
  if (req.body && typeof req.body === "object") req.body = cleanValue(req.body);
  if (req.params && typeof req.params === "object") {
    for (const key of Object.keys(req.params)) {
      req.params[key] = cleanValue(req.params[key]);
    }
  }
  // req.query is a getter in Express 5 / read-only in some setups — sanitize a copy.
  if (req.query && typeof req.query === "object") {
    const cleaned = cleanValue({ ...req.query });
    Object.defineProperty(req, "query", { value: cleaned, writable: true });
  }
  next();
}
