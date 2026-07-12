/**
 * Operational error carrying an HTTP status. Anything that is NOT an ApiError
 * reaching the error handler is treated as an unexpected bug (500, logged loudly).
 */
export class ApiError extends Error {
  constructor(statusCode, message, { errors, code } = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors) {
    return new ApiError(400, message, { errors });
  }
  static unauthorized(message = "unauthorized") {
    return new ApiError(401, message);
  }
  static forbidden(message = "forbidden") {
    return new ApiError(403, message);
  }
  static notFound(message = "not found") {
    return new ApiError(404, message);
  }
  static conflict(message) {
    return new ApiError(409, message);
  }
  static tooMany(message = "too many requests, please try again later") {
    return new ApiError(429, message);
  }
}
