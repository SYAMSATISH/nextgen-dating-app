import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "chats", headerShown: false }}
      />
      <Stack.Screen name="chatscreen" options={{ headerShown: false }} />
    </Stack>
  );
}
