// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   darkMode: "class",
//   content: [
//     "./src/app/**/*.{js,jsx,ts,tsx}",
//     "./src/components/**/*.{js,jsx,ts,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: {
//           DEFAULT: "#16a34a",
//           50:  "#f0fdf4",
//           100: "#dcfce7",
//           200: "#bbf7d0",
//           400: "#4ade80",
//           500: "#22c55e",
//           600: "#16a34a",
//           700: "#15803d",
//           800: "#166534",
//           900: "#14532d",
//         },
//       },
//       animation: {
//         "spin-slow": "spin 3s linear infinite",
//       },
//     },
//   },
//   plugins: [],
// };

// #0B3D2E
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
          DEFAULT: "#0F4C39",

          50: "#F3FBEA",
          100: "#DCF3C4",
          200: "#C8F08A",
          300: "#A8E063",
          400: "#6FBF6A",
          500: "#3D8B5F",
          600: "#0F4C39",
          700: "#0B3D2E",
          800: "#0A3527",
          900: "#08281E",
          950: "#04150F",
        },
        secondary: {
          DEFAULT: "#0F4C39",

          50: "#F3FBEA",
          100: "#DCF3C4",
          200: "#C8F08A",
          300: "#A8E063",
          400: "#6FBF6A",
          500: "#3D8B5F",
          600: "#0F4C39",
          700: "#0B3D2E",
          800: "#0A3527",
          900: "#08281E",
          950: "#04150F",
        },

        accent: {
          DEFAULT: "#FF7A3D",
          light: "#FF8F5C",
        },
      },

      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },

  plugins: [],
};
