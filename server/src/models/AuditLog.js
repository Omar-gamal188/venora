import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    event: { type: String, required: true, maxlength: 64 },
    outcome: { type: String, enum: ["success", "failure"], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    username: { type: String, default: "", maxlength: 64 },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "", maxlength: 512 },
    requestId: { type: String, default: "" },
    details: { type: Object, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ event: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
// Keep 90 days of audit history, then let Mongo expire it.
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
