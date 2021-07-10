const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      screens: {
        phone: { max: "767px" },
        desktop: "768px",
      },
      colors: {
        background: colors.coolGray,
        primary: colors.sky,
        muted: colors.gray,
        validating: colors.yellow,
        invalid: colors.red,
        valid: colors.lime,
        revoked: colors.purple,
        quote: colors.lime,
      },
    },
  },
  variants: {
    extend: {},
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ["./src/components/**/*.ts*", "./pages/**/*.ts*"],
  plugins: [require("tailwindcss"), require("precss"), require("autoprefixer")],
};
