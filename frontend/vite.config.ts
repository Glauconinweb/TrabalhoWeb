/// <reference types="node" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/", // necessário para roteamento SPA
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // permite usar @/ para importar
    },
  },
  build: {
    outDir: "dist",
  },
  server: {
    port: 5174,
  },
  define: {
    "process.env": {}, // para evitar erro com libs que usam process.env
  },
});
