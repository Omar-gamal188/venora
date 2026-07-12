import { ApiError } from "../utils/ApiError.js";
import { productRepository, DATA_URL_MARKER } from "../repositories/productRepository.js";
import { audit } from "./auditService.js";

function requestBaseUrl(req) {
  // trust proxy is enabled in production, so protocol/host reflect the public URL.
  return `${req.protocol}://${req.get("host")}`;
}

/**
 * Exact legacy product shape. Embedded base64 images are exposed as a URL to
 * the image endpoint (with a version stamp for immutable browser caching)
 * instead of being inlined — this keeps list/detail responses small and fast.
 */
function productResponse(p, req) {
  const id = p._id ? p._id.toString() : p.id;
  let image = p.image;
  if (image === DATA_URL_MARKER || (typeof image === "string" && image.startsWith("data:"))) {
    const version = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
    image = `${requestBaseUrl(req)}/api/products/${id}/image?v=${version}`;
  }
  return {
    id,
    title: p.title,
    price: p.price,
    description: p.description ?? "",
    category: p.category,
    image,
    inStock: p.inStock !== false,
  };
}

export async function listProducts(query = {}, req) {
  const { page, limit, category, search, inStock, sort } = query;

  // Legacy mode: no pagination params → bare full array (frontend contract).
  if (!page && !limit) {
    const products = await productRepository.list({ category, search, inStock, sort });
    return { items: products.map((p) => productResponse(p, req)), pagination: null };
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const [items, total] = await Promise.all([
    productRepository.list({
      category,
      search,
      inStock,
      sort,
      skip: (safePage - 1) * safeLimit,
      limit: safeLimit,
    }),
    productRepository.count({ category, search, inStock }),
  ]);
  return {
    items: items.map((p) => productResponse(p, req)),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
}

export async function getProduct(id, req) {
  const product = await productRepository.findById(id);
  if (!product) throw ApiError.notFound();
  return productResponse(product, req);
}

/** Raw image bytes for GET /api/products/:id/image. */
export async function getProductImage(id) {
  const doc = await productRepository.getImageById(id);
  if (!doc || !doc.image) throw ApiError.notFound();

  if (!doc.image.startsWith("data:")) {
    // Externally hosted image — the client should already have the direct URL,
    // but redirect for completeness.
    if (/^https?:\/\//i.test(doc.image)) return { redirectTo: doc.image };
    throw ApiError.notFound();
  }

  const match = /^data:([\w/+.-]+);base64,(.*)$/s.exec(doc.image);
  if (!match) throw ApiError.notFound();
  return { contentType: match[1], buffer: Buffer.from(match[2], "base64") };
}

export async function createProduct(data, req) {
  const product = await productRepository.create({
    ...data,
    createdBy: req.userId ?? null,
  });
  await audit("product.create", "success", req, {
    user: req.userId,
    details: { productId: product._id.toString(), title: product.title },
  });
  return productResponse(product, req);
}

export async function updateProduct(id, updates, req) {
  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest("no valid fields to update");
  }
  const product = await productRepository.updateById(id, updates);
  if (!product) throw ApiError.notFound();
  await audit("product.update", "success", req, {
    user: req.userId,
    details: { productId: id, fields: Object.keys(updates) },
  });
  return productResponse(product, req);
}

export async function deleteProduct(id, req) {
  const deleted = await productRepository.deleteById(id);
  if (!deleted) throw ApiError.notFound();
  await audit("product.delete", "success", req, {
    user: req.userId,
    details: { productId: id },
  });
}
