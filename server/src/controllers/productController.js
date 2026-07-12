import { asyncHandler } from "../utils/asyncHandler.js";
import * as productService from "../services/productService.js";

export const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await productService.listProducts(req.query, req);
  // Legacy contract: no pagination params → bare array (frontend depends on it).
  if (!pagination) return res.json(items);
  res.json({
    success: true,
    message: "ok",
    data: items,
    pagination,
    meta: { requestId: req.id },
  });
});

export const getById = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.params.id, req);
  res.json(product);
});

export const image = asyncHandler(async (req, res) => {
  const result = await productService.getProductImage(req.params.id);
  if (result.redirectTo) return res.redirect(302, result.redirectTo);
  res.setHeader("Content-Type", result.contentType);
  // URL carries an updatedAt version stamp, so the bytes are immutable.
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.send(result.buffer);
});

export const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req);
  res.status(201).json(product);
});

export const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req);
  res.json(product);
});

export const remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, req);
  res.status(204).send();
});
