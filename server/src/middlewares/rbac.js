import { ApiError } from "../utils/ApiError.js";
import { userRepository } from "../repositories/userRepository.js";
import { resolveUserRole } from "../services/authService.js";
import { audit } from "../services/auditService.js";

/**
 * Role gate. Re-resolves the role from the database so a demoted/deactivated
 * user can't keep using an old token's role claim.
 */
export function requireRole(...roles) {
  return async (req, _res, next) => {
    try {
      if (!req.userId) return next(ApiError.unauthorized());
      const user = await userRepository.findById(req.userId);
      if (!user || user.isActive === false) {
        return next(ApiError.unauthorized("user not found"));
      }
      const role = resolveUserRole(user);
      req.userRole = role;
      if (!roles.includes(role)) {
        await audit("authz.denied", "failure", req, {
          user: user._id,
          username: user.username,
          details: { required: roles, actual: role, path: req.originalUrl },
        });
        return next(ApiError.forbidden("insufficient permissions"));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

export const requireAdmin = requireRole("admin");
