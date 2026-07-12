import { ApiError } from "../utils/ApiError.js";

/**
 * Zod validation middleware. `schemas` may contain body/query/params schemas.
 * Parsed (and thus type-coerced + stripped) values replace the originals.
 */
export function validate(schemas) {
  return (req, _res, next) => {
    const errors = [];
    for (const key of ["params", "query", "body"]) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(req[key]);
      if (result.success) {
        if (key === "query") {
          Object.defineProperty(req, "query", { value: result.data, writable: true });
        } else {
          req[key] = result.data;
        }
      } else {
        for (const issue of result.error.issues) {
          errors.push({
            field: [key, ...issue.path].join("."),
            message: issue.message,
          });
        }
      }
    }
    if (errors.length > 0) {
      // Legacy-compatible top-level message (first error), full list in `errors`.
      return next(ApiError.badRequest(errors[0].message, errors));
    }
    next();
  };
}
