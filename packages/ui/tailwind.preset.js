const colors = {
  background: "#121212",
  backgroundSoft: "#121212",
  surface: "#181818",
  surfaceElevated: "#282828",
  surfaceCard: "#181818",
  surfaceCardAlt: "#282828",
  surfaceGlass: "#181818",
  accent: "#1db954",
  accentSoft: "rgba(29, 185, 84, 0.16)",
  accentBorder: "#1ed760",
  accentGlow: "rgba(29, 185, 84, 0.35)",
  text: "#ffffff",
  muted: "#b3b3b3",
  subtle: "#a7a7a7",
  emphasis: "#ffffff",
  negative: "#f3727f",
  warning: "#ffa42b",
  announcement: "#539df5",
  border: "rgba(255, 255, 255, 0.1)",
  borderLight: "rgba(255, 255, 255, 0.16)",
  separator: "#282828",
  artworkPlaceholder: "#282828",
  youtube: "#ff4b4b",
  jiosaavn: "#1ed760",
  spotify: "#1db954",
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        vault: colors,
      },
      fontFamily: {
        sans: ["Inter_400Regular", "System"],
        title: ["PlusJakartaSans_700Bold", "Inter_400Regular", "System"],
      },
      fontSize: {
        micro: ["10px", { lineHeight: "1" }],
        badge: ["10.5px", { lineHeight: "1.33" }],
        caption: ["14px", { lineHeight: "1.5" }],
        body: ["16px", { lineHeight: "1" }],
        heading: ["18px", { lineHeight: "1.3" }],
        title: ["24px", { lineHeight: "1" }],
      },
      borderRadius: {
        vault: {
          sm: "4px",
          md: "8px",
          lg: "12px",
          xl: "16px",
          "2xl": "20px",
          pill: "9999px",
        },
        pill: "9999px",
      },
      boxShadow: {
        vault: {
          soft: "0px 4px 16px rgba(0, 0, 0, 0.4)",
          medium: "0px 8px 24px rgba(0, 0, 0, 0.5)",
          heavy: "0px 12px 32px rgba(0, 0, 0, 0.6)",
          glow: "0px 0px 20px rgba(29, 185, 84, 0.18)",
          inset: "rgba(255, 255, 255, 0.08) 0px 0px 0px 1px inset",
        },
      },
      letterSpacing: {
        button: "1.4px",
      },
    },
  },
};
