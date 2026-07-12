import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { userRepository } from "../repositories/userRepository.js";
import { hashPassword } from "../utils/password.js";

/**
 * Optional startup seeding of the dashboard admin (SEED_DASHBOARD_ADMIN=true).
 * A password must be provided explicitly — no more default "2112".
 */
export async function seedDashboardAdminIfEnabled() {
  if (!env.dashboardAdmin.seedEnabled) return;

  const username = env.dashboardAdmin.username.trim();
  const password = env.dashboardAdmin.seedPassword;
  const email = (
    env.dashboardAdmin.seedEmail || `${username}@dashboard.local`
  ).toLowerCase();

  if (!username) {
    logger.error(
      "SEED_DASHBOARD_ADMIN=true but DASHBOARD_ADMIN_USERNAME is not set — skipping seed",
    );
    return;
  }
  if (!password || password.length < 8) {
    logger.error(
      "SEED_DASHBOARD_ADMIN=true but DASHBOARD_ADMIN_PASSWORD is missing or shorter than 8 characters — skipping seed",
    );
    return;
  }

  try {
    const existing = await userRepository.findByUsername(username);

    if (existing) {
      const update = { $set: { role: "admin" } };
      if (env.dashboardAdmin.updateExistingPassword) {
        update.$set.passwordHash = await hashPassword(password);
        logger.info({ username }, "updated dashboard admin password");
      }
      await userRepository.updateById(existing._id, update);
      logger.info({ username }, "dashboard admin verified (role=admin)");
      return;
    }

    await userRepository.create({
      username,
      email,
      fullName: env.dashboardAdmin.seedFullName,
      phone: "",
      address: "",
      passwordHash: await hashPassword(password),
      role: "admin",
    });
    logger.info({ username }, "created dashboard admin user");
  } catch (err) {
    logger.error({ err }, "seedDashboardAdminIfEnabled failed");
  }
}
