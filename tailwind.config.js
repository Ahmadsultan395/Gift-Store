// used for next — maroon & gold gift store theme
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7A1F2B",

          50: "#FDF3F4",
          100: "#FBE3E5",
          200: "#F3BCC1",
          300: "#E6919A",
          400: "#C85A68",
          500: "#A32E3E",
          600: "#7A1F2B",
          700: "#5E1722",
          800: "#48111A",
          900: "#340C13",
          950: "#1F070B",
        },

        secondary: {
          DEFAULT: "#C9A227",

          50: "#FDFAEF",
          100: "#FAF3D6",
          200: "#F2E2A3",
          300: "#E9D073",
          400: "#DDBB4A",
          500: "#C9A227",
          600: "#A9841D",
          700: "#836417",
          800: "#5E4712",
          900: "#3D2E0C",
          950: "#241B07",
        },

        accent: {
          DEFAULT: "#D4AF37",
          light: "#E9D073",
        },
      },

      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },

  plugins: [],
};
