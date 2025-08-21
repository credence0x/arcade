import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import react from "@vitejs/plugin-react";
import topLevelAwait from "vite-plugin-top-level-await";
import process from "node:process";
import mkcert from "vite-plugin-mkcert";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react" }),
    react(),
    wasm(),
    topLevelAwait(),
    mkcert(),
  ],
  server: {
    port: process.env.NODE_ENV === "development" ? 3003 : undefined,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  root: "./",
  build: {
    outDir: "dist",
    // Ref: https://github.com/vitejs/vite/issues/15012#issuecomment-1948550039
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === "SOURCEMAP_ERROR") {
          return;
        }

        defaultHandler(warning);
      },
    },
  },
  publicDir: "public",
});
