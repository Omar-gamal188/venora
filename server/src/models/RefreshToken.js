import mongoose from "mongoose";

/**
 * One document per device/session. Only the SHA-256 of the token is stored.
 * Rotation: each use invalidates the old token and issues a new one; reuse of
 * a rotated token is treated as theft and revokes the whole session family.
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true },
    family: { type: String, required: true }, // stable per device/session
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    replacedByHash: { type: String, default: null },
    createdByIp: { type: String, default: "" },
    userAgent: { type: String, default: "", maxlength: 512 },
  },
  { timestamps: true },
);

refreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
refreshTokenSchema.index({ user: 1, family: 1 });
// TTL: Mongo removes expired sessions automatically.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
