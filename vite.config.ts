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
      include: ['process', 'buffer'],
      globals: {
        process: true,
        Buffer: true,
      },
    })
  ],
  base: '/',
  server: {
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          wagmi: ['wagmi', 'viem', '@wagmi/core'],
          onchainkit: ['@coinbase/onchainkit'],
        }
      }
    }
  },
  define: {
    global: "globalThis",
    "process.env": "import.meta.env",
  },
  optimizeDeps: {
    exclude: ['pg'],
    include: ['@coinbase/onchainkit/minikit']
  },
});
