import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  // Never buffer commands silently while disconnected — fail fast instead.
  mongoose.set("bufferCommands", false);

  mongoose.connection.on("connected", () => logger.info("MongoDB connected"));
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
  mongoose.connection.on("reconnected", () => logger.info("MongoDB reconnected"));
  mongoose.connection.on("error", (err) =>
    logger.error({ err }, "MongoDB connection error"),
  );

  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 20,
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 2,
    socketTimeoutMS: 45_000,
    autoIndex: env.isDevelopment || process.env.MONGO_AUTO_INDEX === "true",
  });
  return mongoose.connection;
}

export async function disconnectDb() {
  await mongoose.disconnect();
}

export function isDbReady() {
  return mongoose.connection.readyState === 1;
}
