import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath, URL } from "node:url";

// Plugin для CSP в зависимости от среды
const cspPlugin = () => {
  return {
    name: 'csp-plugin',
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        // В production используем более строгую CSP политику
        if (context.server) {
          // Development CSP - более разрешающая
          return html.replace(
            /script-src 'self' 'unsafe-inline' 'unsafe-eval'/,
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
          );
        } else {
          // Production CSP - более строгая, без unsafe-eval
          return html.replace(
            /<meta http-equiv="Content-Security-Policy"[^>]*>/,
            `<meta http-equiv="Content-Security-Policy" content="
              default-src 'self';
              script-src 'self' 'unsafe-inline';
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: blob:;
              connect-src 'self' https:;
              worker-src 'self' blob:;
            ">`
          );
        }
      }
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cspPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
      // FSD Architecture layers
      "@/app": path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "./src/app"
      ),
      "@/pages": path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "./src/pages"
      ),
      "@/widgets": path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "./src/widgets"
      ),
      "@/features": path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "./src/features"
      ),
      "@/entities": path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "./src/entities"
      ),
      "@/shared": path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "./src/shared"
      ),
      // Legacy aliases for compatibility
      "@/assets": path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "./src/shared/assets"
      ),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    cors: true,
    allowedHosts: [
      "backend",
      "localhost",
      "127.0.0.1",
      "requify_frontend",
      "requify-frontend-dev",
    ],
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },
      "/docs": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/redoc": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/openapi.json": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/health": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@mui/material", "@mui/icons-material"],
          state: ["@reduxjs/toolkit", "react-redux"],
          forms: ["react-hook-form", "@hookform/resolvers", "yup"],
        },
      },
    },
  },
  define: {
    global: "globalThis",
    "process.env": {},
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
  preview: {
    port: 3000,
    host: "0.0.0.0",
  },
});
