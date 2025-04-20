/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/presentation/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/application/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "miniflix-red": "#E50914",
        "miniflix-black": "#141414",
        "miniflix-dark": "#181818",
        "miniflix-gray": "#808080",
        "miniflix-light-gray": "#B3B3B3",
      },
      fontFamily: {
        sans: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      screens: {
        xs: "480px",
      },
      spacing: {
        128: "32rem",
        144: "36rem",
      },
      height: {
        128: "32rem",
      },
      width: {
        128: "32rem",
      },
    },
  },
  plugins: [],
};
