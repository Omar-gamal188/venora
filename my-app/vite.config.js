import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Root path for normal hosting (Vercel, Nginx). Set VITE_BASE=/ForTest/
  // only when deploying to GitHub Pages under that subpath.
  base: process.env.VITE_BASE || "/",
});
