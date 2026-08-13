/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../apps/web/src/**/*.{js,ts,jsx,tsx}",
    "../../apps/web/index.html",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0B3156",
          gold: "#C3A55F",
          coastal: "#1677A6",
          cream: "#F6F0E4",
          sand: "#D9C79D",
        },
        neutral: {
          900: "#1F2933",
          600: "#5B6872",
          200: "#DCE2E6",
        },
        surface: "#FFFFFF",
        success: "#287A4B",
        warning: "#C98316",
        danger: "#B83838",
      },
      fontFamily: {
        display: ['"Barlow Condensed"', "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        touch: "10px",
      },
      minHeight: {
        touch: "48px",
      },
      minWidth: {
        touch: "48px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
