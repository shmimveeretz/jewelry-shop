import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Globs must be absolute (Vite runs with a config outside the project root) and
// POSIX-separated, which is the only form fast-glob accepts on Windows.
const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..").replace(/\\/g, "/");

export default {
  content: [`${frontendRoot}/index.html`, `${frontendRoot}/src/**/*.{js,jsx}`],

  // This site predates Tailwind: styles/index.css owns the global reset and
  // defines its own .container. Preflight and Tailwind's container would both
  // restyle every existing page, so they stay off. See styles/tailwind.css for
  // the Preflight bits restored inside the campaign subtree.
  corePlugins: {
    preflight: false,
    container: false,
  },

  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#2c3e50", deep: "#1f2937" },
        gold: { DEFAULT: "#d4af37", soft: "#c5a572", dark: "#b8962e" },
        cream: "#f5f5f0",
      },
      fontFamily: {
        serif: ['"Cardo"', "serif"],
        display: ['"Bona Nova"', "serif"],
      },
      // Prefixed to stay clear of the animate-*/delay-* classes index.css defines
      // — index.css is loaded last and would otherwise win.
      keyframes: {
        dppRise: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "none" },
        },
        dppPulse: {
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "dpp-rise": "dppRise 0.5s ease-out both",
        "dpp-pulse": "dppPulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },

  plugins: [],
};
