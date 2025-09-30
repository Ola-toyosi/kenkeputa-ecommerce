// app/_layout.tsx
import { Stack } from "expo-router";
import { useContext } from "react";
import { AuthContext, AuthProvider } from "./context/AuthContext";

function RootNavigator() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
