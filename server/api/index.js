/**
 * Vercel serverless entrypoint. The whole Express app runs as one function;
 * vercel.json rewrites every path here. The MongoDB connection is established
 * once per warm instance and reused across invocations.
 */
import { createApp } from "../src/app.js";
import { connectDb, isDbReady } from "../src/config/db.js";

const app = createApp();
let connecting = null;

export default async function handler(req, res) {
  if (!isDbReady()) {
    // Share one in-flight connection attempt; reset it on failure so the
    // next invocation can retry instead of caching a rejected promise.
    connecting ||= connectDb().catch((err) => {
      connecting = null;
      throw err;
    });
    await connecting;
  }
  return app(req, res);
}
