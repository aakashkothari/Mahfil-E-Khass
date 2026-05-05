/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0d1020",
        "surface-soft": "#121830",
        "surface-card": "#171d36",
        "surface-elevated": "#1d2543",
        "surface-border": "rgba(209, 204, 255, 0.14)",
        "text-main": "#f5f0e8",
        "text-soft": "#c7c0d8",
        primary: "#7b73e0",
        "primary-deep": "#534ab7",
        gold: "#ef9f27",
        "gold-soft": "#f7c06a",
        success: "#2bb673",
        danger: "#e86b6b",
        mood: {
          ishq: "#f472b6",
          dard: "#a78bfa",
          tanhai: "#94a3b8",
          khushi: "#4ade80",
          gussa: "#f87171",
          umeed: "#2dd4bf",
          yaadein: "#fbbf24",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        poetry: ["Newsreader", "Noto Nastaliq Urdu", "serif"],
        urdu: ["Noto Nastaliq Urdu", "Newsreader", "serif"],
      },
      boxShadow: {
        ambient: "0 20px 60px rgba(10, 13, 28, 0.45)",
        indigo: "0 4px 20px rgba(83, 74, 183, 0.18)",
      },
      borderRadius: {
        card: "1rem",
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
          "radial-gradient(circle at top, rgba(123, 115, 224, 0.24), transparent 34%), radial-gradient(circle at 20% 90%, rgba(239, 159, 39, 0.15), transparent 28%), linear-gradient(180deg, #0b0f1d 0%, #0d1020 55%, #0a0d19 100%)",
      },
    },
  },
  plugins: [],
};
