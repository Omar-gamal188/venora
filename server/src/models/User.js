import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 64,
      match: /^[a-zA-Z0-9._-]+$/,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 128,
    },
    fullName: { type: String, required: true, trim: true, maxlength: 128 },
    phone: { type: String, default: "", trim: true, maxlength: 32 },
    address: { type: String, default: "", trim: true, maxlength: 512 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, default: null, select: false },
    emailVerificationExpiresAt: { type: Date, default: null, select: false },

    passwordResetTokenHash: { type: String, default: null, select: false },
    passwordResetExpiresAt: { type: Date, default: null, select: false },
    passwordChangedAt: { type: Date, default: null },

    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },
    lastLoginAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Case-insensitive uniqueness + fast case-insensitive login lookups.
userSchema.index(
  { username: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
    // Explicit name so it can coexist with the legacy plain `username_1` index.
    name: "username_ci_unique",
  },
);
userSchema.index({ email: 1 }, { unique: true });

userSchema.virtual("isLocked").get(function () {
  return Boolean(this.lockUntil && this.lockUntil > new Date());
});

userSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    delete ret.emailVerificationTokenHash;
    delete ret.emailVerificationExpiresAt;
    delete ret.passwordResetTokenHash;
    delete ret.passwordResetExpiresAt;
    delete ret.failedLoginAttempts;
    delete ret.lockUntil;
    delete ret.isLocked;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);
