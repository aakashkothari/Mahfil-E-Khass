/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#faf9f6",
        "surface-soft": "#f4f3f1",
        "surface-card": "#ffffff",
        "surface-elevated": "#efeeeb",
        "surface-border": "rgba(83, 74, 183, 0.15)",
        "text-main": "#1a1c1a",
        "text-soft": "#474553",
        primary: "#534ab7",
        "primary-deep": "#3b309e",
        "primary-container": "#6a61ca",
        gold: "#ef9f27",
        "gold-soft": "#fcaa33",
        success: "#2f8f5b",
        danger: "#ba1a1a",
        mood: {
          ishq: "#be5b86",
          dard: "#6f63be",
          tanhai: "#7c7c8c",
          khushi: "#4d8b54",
          gussa: "#c75a58",
          umeed: "#3a8f87",
          yaadein: "#b5892e",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        poetry: ["Newsreader", "Noto Nastaliq Urdu", "serif"],
        urdu: ["Noto Nastaliq Urdu", "Newsreader", "serif"],
      },
      boxShadow: {
        ambient: "0 12px 32px rgba(83, 74, 183, 0.05)",
        indigo: "0 4px 20px rgba(83, 74, 183, 0.06)",
      },
      borderRadius: {
        card: "0.5rem",
      },
      maxWidth: {
        poetry: "680px",
        shell: "1120px",
      },
      spacing: {
        "stack-poetry": "2rem",
        gutter: "1.5rem",
        "margin-page": "1.5rem",
      },
      backgroundImage: {
        "mahfil-glow":
          "radial-gradient(circle at top, rgba(83, 74, 183, 0.07), transparent 28%), radial-gradient(circle at 18% 96%, rgba(239, 159, 39, 0.08), transparent 20%), linear-gradient(180deg, #fcfbf8 0%, #faf9f6 52%, #f5f3ee 100%)",
      },
    },
  },
  plugins: [],
};
