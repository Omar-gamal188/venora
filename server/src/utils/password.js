import argon2 from "argon2";
import bcrypt from "bcryptjs";

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 4,
};

export async function hashPassword(plain) {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

/**
 * Verifies against Argon2 hashes, with transparent support for legacy bcrypt
 * hashes created by the previous backend. Returns:
 *   { valid: boolean, needsRehash: boolean }
 */
export async function verifyPassword(hash, plain) {
  if (typeof hash !== "string" || !hash) return { valid: false, needsRehash: false };

  if (hash.startsWith("$argon2")) {
    const valid = await argon2.verify(hash, plain).catch(() => false);
    return { valid, needsRehash: valid && argon2.needsRehash(hash, ARGON2_OPTIONS) };
  }

  // Legacy bcrypt ($2a$ / $2b$ / $2y$) — verify, then caller rehashes to argon2.
  if (/^\$2[aby]\$/.test(hash)) {
    const valid = await bcrypt.compare(plain, hash).catch(() => false);
    return { valid, needsRehash: valid };
  }

  return { valid: false, needsRehash: false };
}
