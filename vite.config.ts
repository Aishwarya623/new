import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import postcssConfig from './postcss.config.cjs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// vite.config.ts


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "docs"), // ✅ Change to "docs"
    emptyOutDir: true, // Clears old files in docs
  },
  base: "/new/", // ✅ Set to your repo name to load assets properly
});
