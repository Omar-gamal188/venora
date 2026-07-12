import crypto from "node:crypto";

/** Opaque high-entropy token for refresh / reset / verification flows. */
export function generateOpaqueToken() {
  return crypto.randomBytes(48).toString("base64url");
}

/** Store only the SHA-256 of opaque tokens so a DB leak can't replay them. */
export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function timingSafeEqualHex(a, b) {
  const ba = Buffer.from(String(a), "hex");
  const bb = Buffer.from(String(b), "hex");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
