/**
 * One-shot: create or reset the primary dashboard admin (password + role admin).
 * Run from server/: DASHBOARD_ADMIN_PASSWORD=<strong password> npm run admin:reset
 */
import { env } from "../config/env.js";
import { connectDb, disconnectDb } from "../config/db.js";
import { userRepository } from "../repositories/userRepository.js";
import { hashPassword } from "../utils/password.js";

async function main() {
  const username = env.dashboardAdmin.username.trim();
  const password = env.dashboardAdmin.seedPassword;

  if (!username) {
    console.error(
      "Set DASHBOARD_ADMIN_USERNAME in the environment or .env before running this script.",
    );
    process.exit(1);
  }
  const email = (
    env.dashboardAdmin.seedEmail || `${username}@dashboard.local`
  ).toLowerCase();

  if (!password || password.length < 8) {
    console.error(
      "Set DASHBOARD_ADMIN_PASSWORD (min 8 chars) in the environment or .env before running this script.",
    );
    process.exit(1);
  }

  await connectDb();
  const passwordHash = await hashPassword(password);
  const user = await userRepository.findByUsername(username);

  if (user) {
    await userRepository.updateById(user._id, {
      $set: { passwordHash, role: "admin", failedLoginAttempts: 0, lockUntil: null },
    });
    console.log("Updated password and role for:", username);
  } else {
    await userRepository.create({
      username,
      email,
      fullName: env.dashboardAdmin.seedFullName,
      phone: "",
      address: "",
      passwordHash,
      role: "admin",
    });
    console.log("Created admin user:", username);
  }

  console.log("You can sign in with username:", username);
  await disconnectDb();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
