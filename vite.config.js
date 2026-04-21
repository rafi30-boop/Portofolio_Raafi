import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/", // 🔥 TAMBAHKAN INI
  plugins: [react()],
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "react-vendor";
            }
            if (id.includes("react-icons")) {
              return "icons-vendor";
            }
            if (id.includes("@supabase/supabase-js")) {
              return "supabase-vendor";
            }
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});