import path from "node:path";
import react from "@vitejs/plugin-react";
import { aiapps } from "aiapps/web";
import { defineConfig, type PluginOption } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [aiapps() as PluginOption, react()],
  root: __dirname,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
