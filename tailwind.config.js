/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}", // include your app directory
    "./src/components/**/*.{js,ts,jsx,tsx}", // if you also keep components outside app
  ],
  theme: {
    extend: {
      colors: {
        taypro: "#A8C117", // custom brand color
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["var(--font-blinker)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
