const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      screens: {
        phone: { max: "767px" },
        table: "768px",
        desktop: "1024px",
      },
      colors: {
        background: colors.coolGray,
        primary: colors.lightBlue,
        muted: colors.gray,
        validating: colors.yellow,
        invalid: colors.red,
        valid: colors.lime,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
