/**
 * One-shot: create (or update) an admin account.
 * Replaces the old addAdminTarek.js, which hardcoded credentials in source —
 * never acceptable for a public deployment. Credentials now come from args:
 *
 *   npm run admin:add -- <email> <username> <password>
 */
import { connectDb, disconnectDb } from "../config/db.js";
import { userRepository } from "../repositories/userRepository.js";
import { hashPassword } from "../utils/password.js";

async function main() {
  const [email, preferredUsername, password] = process.argv.slice(2);
  if (!email || !preferredUsername || !password) {
    console.error("Usage: npm run admin:add -- <email> <username> <password>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  await connectDb();
  const emailNorm = email.toLowerCase().trim();
  const passwordHash = await hashPassword(password);

  const byEmail = await userRepository.findByEmail(emailNorm);
  if (byEmail) {
    await userRepository.updateById(byEmail._id, {
      $set: { passwordHash, role: "admin", failedLoginAttempts: 0, lockUntil: null },
    });
    console.log("Updated existing user — admin. Sign in with username:", byEmail.username);
  } else {
    let username = preferredUsername.trim();
    const taken = await userRepository.findByUsername(username);
    if (taken) username = `${username}_admin`;
    await userRepository.create({
      username,
      email: emailNorm,
      fullName: username,
      phone: "",
      address: "",
      passwordHash,
      role: "admin",
    });
    console.log("Created admin — sign in with username:", username);
  }

  await disconnectDb();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
