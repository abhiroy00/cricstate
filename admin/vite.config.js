import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Production serves this app from http://<host>/admin/ (same nginx/origin
  // as the web app, at a subpath) - dev keeps serving from / on its own port.
  base: mode === "production" ? "/admin/" : "/",
  server: {
    port: 5174,
    host: true,
  },
}));
