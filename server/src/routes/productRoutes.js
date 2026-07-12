import { Router } from "express";
import * as productController from "../controllers/productController.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import { validateIdParam } from "../validators/common.js";
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
} from "../validators/productSchemas.js";

export const productsRouter = Router();

// Public catalog reads.
productsRouter.get("/", validate({ query: listProductsQuerySchema }), productController.list);
productsRouter.get("/:id", validateIdParam, productController.getById);
productsRouter.get("/:id/image", validateIdParam, productController.image);

// Mutations are admin-only (previously completely unauthenticated!).
productsRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  validate({ body: createProductSchema }),
  productController.create,
);
productsRouter.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validateIdParam,
  validate({ body: updateProductSchema }),
  productController.update,
);
productsRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateIdParam,
  productController.remove,
);
