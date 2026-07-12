import { Product } from "../models/Product.js";

/**
 * Marker the list pipeline substitutes for embedded base64 images so multi-MB
 * data URLs never leave MongoDB on list queries — the service layer swaps the
 * marker for a lightweight /api/products/:id/image URL.
 */
export const DATA_URL_MARKER = "__DATA_URL__";

const SORT_MAP = {
  createdAt: { createdAt: 1 },
  "-createdAt": { createdAt: -1 },
  price: { price: 1 },
  "-price": { price: -1 },
  title: { title: 1 },
  "-title": { title: -1 },
};

function buildFilter({ category, search, inStock } = {}) {
  const filter = {};
  if (category) filter.category = category;
  if (typeof inStock === "boolean") filter.inStock = inStock;
  if (search) filter.$text = { $search: search };
  return filter;
}

export const productRepository = {
  /**
   * Aggregation so embedded images are replaced by a marker server-side —
   * the response payload stays small no matter how many products exist.
   */
  list({ category, search, inStock, sort = "-createdAt", skip = 0, limit = 0 } = {}) {
    const pipeline = [
      { $match: buildFilter({ category, search, inStock }) },
      { $sort: SORT_MAP[sort] ?? SORT_MAP["-createdAt"] },
    ];
    if (skip > 0) pipeline.push({ $skip: skip });
    if (limit > 0) pipeline.push({ $limit: limit });
    pipeline.push({
      $project: {
        title: 1,
        price: 1,
        description: 1,
        category: 1,
        inStock: 1,
        createdAt: 1,
        updatedAt: 1,
        image: {
          $cond: [
            { $eq: [{ $substrCP: ["$image", 0, 5] }, "data:"] },
            DATA_URL_MARKER,
            "$image",
          ],
        },
      },
    });
    return Product.aggregate(pipeline);
  },

  count(filters = {}) {
    return Product.countDocuments(buildFilter(filters));
  },

  findById(id) {
    return Product.findById(id)
      .select("title price description category image inStock createdAt updatedAt")
      .lean();
  },

  /** Only the image payload + freshness stamp, for the image endpoint. */
  getImageById(id) {
    return Product.findById(id).select("image updatedAt").lean();
  },

  create(data) {
    return Product.create(data);
  },

  updateById(id, updates) {
    return Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .select("title price description category image inStock createdAt updatedAt")
      .lean();
  },

  deleteById(id) {
    return Product.findByIdAndDelete(id).select("_id").lean();
  },
};
