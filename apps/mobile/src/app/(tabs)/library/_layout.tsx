import { Stack } from "expo-router";

export default function LibraryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#121212" },
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="history" />
      <Stack.Screen name="downloads" />
      <Stack.Screen name="import" />
      <Stack.Screen name="[playlistId]" />
    </Stack>
  );
}
