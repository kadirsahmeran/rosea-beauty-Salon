import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { prerenderMeta } from "./vite-plugins/prerenderMeta";

export default defineConfig({
  // prerenderMeta derleme sonunda her sayfa için ayrı bir index.html üretip
  // içine o sayfanın meta bilgilerini gömer — paylaşım önizlemeleri için.
  plugins: [react(), tailwindcss(), prerenderMeta()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("react-dom") ||
            id.includes("/react/") ||
            id.includes("react-router") ||
            id.includes("scheduler")
          ) {
            return "react-vendor";
          }

          if (id.includes("@supabase")) return "supabase";
          if (id.includes("swiper")) return "swiper";
          if (id.includes("yet-another-react-lightbox")) return "lightbox";
          if (id.includes("react-hook-form")) return "forms";
        },
      },
    },
  },
});
