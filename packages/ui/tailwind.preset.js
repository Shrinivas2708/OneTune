const colors = {
  background: "#121212",
  surface: "#181818",
  surfaceElevated: "#1f1f1f",
  surfaceCard: "#252525",
  surfaceCardAlt: "#272727",
  accent: "#1ed760",
  accentBorder: "#1db954",
  text: "#ffffff",
  muted: "#b3b3b3",
  subtle: "#cbcbcb",
  emphasis: "#fdfdfd",
  negative: "#f3727f",
  warning: "#ffa42b",
  announcement: "#539df5",
  border: "#4d4d4d",
  borderLight: "#7c7c7c",
  separator: "#b3b3b3",
  artworkPlaceholder: "#282828",
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
          md: "6px",
          lg: "8px",
          xl: "10px",
          pill: "9999px",
        },
        pill: "9999px",
      },
      boxShadow: {
        vault: {
          medium: "0px 8px 8px rgba(0, 0, 0, 0.3)",
          heavy: "0px 8px 24px rgba(0, 0, 0, 0.5)",
          inset:
            "rgb(18, 18, 18) 0px 1px 0px, rgb(124, 124, 124) 0px 0px 0px 1px inset",
        },
      },
      letterSpacing: {
        button: "1.4px",
      },
    },
  },
};
