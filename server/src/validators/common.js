import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

/**
 * Legacy contract: a malformed id behaves like a missing document (404),
 * matching the old CastError handling.
 */
export function validateIdParam(req, _res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(ApiError.notFound());
  }
  next();
}
