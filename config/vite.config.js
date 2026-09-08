import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import tailwindConfig from "./tailwind.config.js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Declared inline rather than via a postcss.config.js: this config lives in
  // config/, which PostCSS's own file discovery would not look in.
  css: {
    postcss: {
      plugins: [tailwindcss(tailwindConfig), autoprefixer()],
    },
  },
});
