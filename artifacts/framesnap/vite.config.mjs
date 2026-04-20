import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(rootDir, "..");

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;

if (rawPort && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

const apiProxyTarget =
  process.env.VITE_API_PROXY_TARGET ??
  process.env.API_ORIGIN ??
  "http://127.0.0.1:3001";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: monorepoRoot,
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
      "@assets": path.resolve(rootDir, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: rootDir,
  build: {
    outDir: path.resolve(rootDir, "dist/public"),
    emptyOutDir: true,
    modulePreload: false,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        ws: true,
        timeout: 30 * 60 * 1000,
        proxyTimeout: 30 * 60 * 1000,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
