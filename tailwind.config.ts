import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        peach: { DEFAULT: "#FFF1E8", deep: "#FFE2CF" },
        plum: { DEFAULT: "#2D1B3D", soft: "#5A4867" },
        // Team colours: the two "corners" of every debate
        tang: { DEFAULT: "#FF8A1F", dark: "#D96A06" },
        iris: { DEFAULT: "#5B5BF0", dark: "#3F3FC9" },
        sun: { DEFAULT: "#FFD23F", dark: "#D9A800" },
        leaf: { DEFAULT: "#2FBF71", dark: "#1F9655" },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-rounded", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-rounded", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -18px rgba(45, 27, 61, 0.45)",
        tang: "0 4px 0 0 #D96A06",
        iris: "0 4px 0 0 #3F3FC9",
        plum: "0 4px 0 0 #2D1B3D",
      },
      keyframes: {
        pop: { "0%": { transform: "scale(0.92)", opacity: "0" }, "60%": { transform: "scale(1.03)", opacity: "1" }, "100%": { transform: "scale(1)" } },
        wiggle: { "0%,100%": { transform: "rotate(-3deg)" }, "50%": { transform: "rotate(3deg)" } },
        buzz: { "0%,100%": { transform: "translateX(0)" }, "20%,60%": { transform: "translateX(-8px)" }, "40%,80%": { transform: "translateX(8px)" } },
        "slide-up": { "0%": { transform: "translateY(100%)" }, "100%": { transform: "translateY(0)" } },
        fade: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        bounce3: { "0%,80%,100%": { transform: "translateY(0)" }, "40%": { transform: "translateY(-5px)" } },
      },
      animation: {
        pop: "pop 0.35s ease-out both",
        wiggle: "wiggle 0.4s ease-in-out infinite",
        buzz: "buzz 0.45s ease-in-out 2",
        "slide-up": "slide-up 0.28s ease-out both",
        fade: "fade 0.2s ease-out both",
        bounce3: "bounce3 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
