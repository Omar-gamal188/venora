import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    price: { type: Number, required: true, min: 0, max: 1_000_000 },
    description: { type: String, default: "", maxlength: 10_000 },
    category: { type: String, required: true, trim: true, maxlength: 100 },
    image: { type: String, required: true, trim: true },
    inStock: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ title: "text", description: "text" });

productSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.createdBy;
    return ret;
  },
});

export const Product = mongoose.model("Product", productSchema);
