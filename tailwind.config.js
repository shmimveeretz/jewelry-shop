/** @type {import('tailwindcss').Config} */
export default {
  // Scope Tailwind to only files that use tw- prefixed or Tailwind classes
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  // Disable preflight (base reset) so it doesn't conflict with existing CSS
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
