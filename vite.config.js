import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  build: { target: 'esnext', },
resolve: { alias: { "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src") }},
  server: { allowedHosts: true, host: true, strictPort: true, port: 5173 }
});