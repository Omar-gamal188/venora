/**
 * Vercel serverless entrypoint (used when routing goes through vercel.json
 * rewrites). The app itself lazily connects to MongoDB on the first request
 * of each cold instance — see ensureDbConnected in src/app.js.
 */
export { default } from "../src/app.js";
