/**
 * VibeVault design tokens — sourced from docs/DESIGN.md
 */

export const colors = {
  background: "#121212",
  surface: "#181818",
  surfaceElevated: "#1f1f1f",
  surfaceCard: "#252525",
  surfaceCardAlt: "#272727",
  accent: "#1ed760",
  accentBorder: "#1db954",
  text: "#ffffff",
  textMuted: "#b3b3b3",
  textSubtle: "#cbcbcb",
  textEmphasis: "#fdfdfd",
  negative: "#f3727f",
  warning: "#ffa42b",
  announcement: "#539df5",
  border: "#4d4d4d",
  borderLight: "#7c7c7c",
  separator: "#b3b3b3",
  lightSurface: "#eeeeee",
  artworkPlaceholder: "#282828",
} as const;

export const spacing = {
  unit: 8,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
} as const;

export const radii = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 10,
  "2xl": 20,
  pill: 9999,
  circle: "50%",
} as const;

export const shadows = {
  medium: "0px 8px 8px rgba(0, 0, 0, 0.3)",
  heavy: "0px 8px 24px rgba(0, 0, 0, 0.5)",
  insetBorder:
    "rgb(18, 18, 18) 0px 1px 0px, rgb(124, 124, 124) 0px 0px 0px 1px inset",
} as const;

export const typography = {
  sectionTitle: { fontSize: 24, fontWeight: "700" as const, lineHeight: 1 },
  featureHeading: {
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 1.3,
  },
  body: { fontSize: 16, fontWeight: "400" as const, lineHeight: 1 },
  bodyBold: { fontSize: 16, fontWeight: "700" as const, lineHeight: 1 },
  button: { fontSize: 14, fontWeight: "700" as const, lineHeight: 1 },
  buttonUppercase: {
    fontSize: 14,
    fontWeight: "700" as const,
    lineHeight: 1,
    letterSpacing: 1.4,
    textTransform: "uppercase" as const,
  },
  navLink: { fontSize: 14, fontWeight: "400" as const, lineHeight: 1 },
  navLinkBold: { fontSize: 14, fontWeight: "700" as const, lineHeight: 1 },
  caption: { fontSize: 14, fontWeight: "400" as const, lineHeight: 1.5 },
  captionBold: { fontSize: 14, fontWeight: "700" as const, lineHeight: 1.5 },
  small: { fontSize: 12, fontWeight: "400" as const, lineHeight: 1.5 },
  smallBold: { fontSize: 12, fontWeight: "700" as const, lineHeight: 1.5 },
  badge: { fontSize: 10.5, fontWeight: "600" as const, lineHeight: 1.33 },
  micro: { fontSize: 10, fontWeight: "400" as const, lineHeight: 1 },
} as const;

export const fonts = {
  title: "PlusJakartaSans_700Bold",
  body: "Inter_400Regular",
  bodySemiBold: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
} as const;

export const animation = {
  fast: 200,
  normal: 300,
  slow: 350,
} as const;
