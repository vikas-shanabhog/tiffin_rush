/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#221C16",
        paper: "#FBF7EE",
        paperdim: "#F1EADA",
        chili: "#C6432B",
        mustard: "#E3A72F",
        sage: "#6B8F71",
        line: "#D8CFBC",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
