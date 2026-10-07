import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import tailwindConfig from "./tailwind.config.js";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Declared inline rather than via a postcss.config.js: this config lives in
  // config/, which PostCSS's own file discovery would not look in.
  css: {
    postcss: {
      plugins: [tailwindcss(tailwindConfig), autoprefixer()],
    },
  },
  // Production bundles drop console.log/info/debug (they leaked order and
  // image details into every visitor's console). warn/error stay for support.
  esbuild:
    mode === "production"
      ? { pure: ["console.log", "console.info", "console.debug"], legalComments: "none" }
      : {},
  build: {
    rollupOptions: {
      output: {
        // React and the router change rarely: keep them in their own
        // long-cached chunk so app deploys don't force a re-download.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
}));
