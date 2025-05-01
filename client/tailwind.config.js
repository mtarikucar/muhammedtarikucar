/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
const { themeColors, themeTypography, themeShadows, themeBorderRadius } = require("./src/theme");

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: themeColors.primary,
        secondary: themeColors.secondary,
        success: themeColors.success,
        error: themeColors.error,
        warning: themeColors.warning,
        info: themeColors.info,
      },
      fontFamily: {
        sans: [themeTypography.fontFamily],
      },
      boxShadow: themeShadows,
      borderRadius: themeBorderRadius,
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
});
