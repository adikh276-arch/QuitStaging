import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: "/quit_staging/",
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      nodePolyfills(),
    ],
    define: {
      'import.meta.env.VITE_DATABASE_URL': JSON.stringify(env.VITE_DATABASE_URL || env.DATABASE_URL),
      'import.meta.env.VITE_NEON_API_KEY': JSON.stringify(env.VITE_NEON_API_KEY || env.NEON_API_KEY),
      'import.meta.env.VITE_NEON_PROJECT_ID': JSON.stringify(env.VITE_NEON_PROJECT_ID || env.NEON_PROJECT_ID),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
