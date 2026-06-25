/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset"), require("@vibevault/ui/tailwind")],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter_400Regular", "System"],
        "inter-semibold": ["Inter_600SemiBold", "System"],
        "inter-bold": ["Inter_700Bold", "System"],
        jakarta: ["PlusJakartaSans_700Bold", "System"],
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
