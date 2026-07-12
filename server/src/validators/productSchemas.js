import { z } from "zod";
import { env } from "../config/env.js";

const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

/**
 * Product images arrive either as an http(s) URL or a base64 data URL
 * (the dashboard compresses uploads client-side). Validate MIME + size.
 */
const imageSchema = z
  .string({ message: "title, price, category, and image are required" })
  .trim()
  .min(1, "title, price, category, and image are required")
  .superRefine((value, ctx) => {
    if (value.startsWith("data:")) {
      const match = /^data:([\w/+.-]+);base64,/.exec(value);
      if (!match) {
        ctx.addIssue({ code: "custom", message: "invalid image data URL" });
        return;
      }
      if (!ALLOWED_IMAGE_MIME.has(match[1].toLowerCase())) {
        ctx.addIssue({
          code: "custom",
          message: `unsupported image type: ${match[1]}`,
        });
      }
      if (value.length > env.maxImageDataUrlBytes) {
        ctx.addIssue({
          code: "custom",
          message: `image is too large (max ${Math.round(env.maxImageDataUrlBytes / 1024 / 1024)}MB)`,
        });
      }
      return;
    }
    let url;
    try {
      url = new URL(value);
    } catch {
      ctx.addIssue({ code: "custom", message: "image must be a valid URL or data URL" });
      return;
    }
    if (!["http:", "https:"].includes(url.protocol)) {
      ctx.addIssue({ code: "custom", message: "image URL must use http or https" });
    }
  });

const price = z.coerce
  .number({ message: "price must be a non-negative number" })
  .min(0, "price must be a non-negative number")
  .max(1_000_000, "price is too large");

export const createProductSchema = z.object({
  title: z
    .string({ message: "title, price, category, and image are required" })
    .trim()
    .min(1, "title, price, category, and image are required")
    .max(200, "title is too long"),
  price,
  category: z
    .string({ message: "title, price, category, and image are required" })
    .trim()
    .min(1, "title, price, category, and image are required")
    .max(100, "category is too long"),
  image: imageSchema,
  description: z.string().max(10_000, "description is too long").optional().default(""),
  inStock: z.boolean().optional().default(true),
});

export const updateProductSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    price,
    category: z.string().trim().min(1).max(100),
    image: imageSchema,
    description: z.string().max(10_000),
    inStock: z.boolean(),
  })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "no valid fields to update",
  });

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  category: z.string().trim().max(100).optional(),
  search: z.string().trim().max(200).optional(),
  inStock: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sort: z.enum(["price", "-price", "createdAt", "-createdAt", "title", "-title"]).optional(),
});
