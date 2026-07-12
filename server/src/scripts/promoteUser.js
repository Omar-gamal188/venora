/**
 * Grant dashboard admin to an existing account by username.
 * Run from server/: npm run admin:promote -- <username>
 */
import { connectDb, disconnectDb } from "../config/db.js";
import { userRepository } from "../repositories/userRepository.js";

async function main() {
  const username = process.argv[2];
  if (!username?.trim()) {
    console.error("Usage: npm run admin:promote -- <username>");
    process.exit(1);
  }

  await connectDb();
  const user = await userRepository.findByUsername(username);
  if (!user) {
    console.error("User not found:", username);
    await disconnectDb();
    process.exit(1);
  }
  await userRepository.updateById(user._id, { $set: { role: "admin" } });
  console.log("OK —", user.username, "is now an admin.");
  await disconnectDb();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
