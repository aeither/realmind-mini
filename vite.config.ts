import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['process'],
      globals: {
        process: true,
      },
    })
  ],
  server: {
    allowedHosts: true,
  },
  define: {
    global: "globalThis",
    "process.env": "import.meta.env",
  },
  optimizeDeps: {
    exclude: ['pg'],
  },
});
