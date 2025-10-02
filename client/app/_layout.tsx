import { Stack } from "expo-router";
import { useContext } from "react";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import { StatusBar } from "react-native";
import Toast from "react-native-toast-message";
import { CartProvider } from "./context/CartContext";
import { AdminProductsProvider } from "./context/ProductsContext";

function RootLayoutNav() {
  const { user } = useContext(AuthContext);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!user ? (
        // Screens when user is not logged in
        <>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
          <Stack.Screen name="products" options={{ headerShown: false }} />
          <Stack.Screen name="products/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ headerShown: false }} />
        </>
      ) : (
        // Screens when user is logged in
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="wishlist" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <CartProvider>
      <AuthProvider>
        <AdminProductsProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <RootLayoutNav />
          <Toast />
        </AdminProductsProvider>
      </AuthProvider>
    </CartProvider>
  );
}
