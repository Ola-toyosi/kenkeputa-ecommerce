import api from "@/app/api/api";
import { AuthContext } from "@/app/context/AuthContext";
import { useState, useContext, useEffect } from "react";
import Toast from "react-native-toast-message";
import { Platform } from "react-native";
import { CartItem } from "@/types/models";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useCart = () => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sessionKey, setSessionKey] = useState<string | null>(null);

  // Storage utility that works in both web and mobile
  const storage = {
    async getItem(key: string): Promise<string | null> {
      if (Platform.OS === "web") {
        // Use localStorage for web
        return localStorage.getItem(key);
      } else {
        // Use SecureStore for mobile (you'll need to import it conditionally)
        const SecureStore = await import("expo-secure-store");
        return SecureStore.getItemAsync(key);
      }
    },

    async setItem(key: string, value: string): Promise<void> {
      if (Platform.OS === "web") {
        localStorage.setItem(key, value);
      } else {
        const SecureStore = await import("expo-secure-store");
        await SecureStore.setItemAsync(key, value);
      }
    },

    async removeItem(key: string): Promise<void> {
      if (Platform.OS === "web") {
        localStorage.removeItem(key);
      } else {
        const SecureStore = await import("expo-secure-store");
        await SecureStore.deleteItemAsync(key);
      }
    },
  };

  // Get or create session key for anonymous users
  const getOrCreateSessionKey = async (): Promise<string> => {
    if (user) return ""; // No session key needed for authenticated users

    try {
      // Try to get existing session key from storage
      let storedSessionKey = await storage.getItem("cart_session_key");

      if (!storedSessionKey) {
        // Generate new session key
        storedSessionKey = `web_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        await storage.setItem("cart_session_key", storedSessionKey);
      }

      setSessionKey(storedSessionKey);
      return storedSessionKey;
    } catch (error) {
      console.error("Error managing session key:", error);
      // Fallback to generating a simple session key
      const fallbackKey = `web_${Date.now()}`;
      setSessionKey(fallbackKey);
      return fallbackKey;
    }
  };

  // Add session key to API requests for anonymous users
  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    } else {
      const sessionKey = await getOrCreateSessionKey();
      return { "X-Session-Key": sessionKey };
    }
  };

  const getCart = async () => {
    // Prevent multiple simultaneous calls
    if (loading) return;

    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await api.get("/cart/", { headers });
      // console.log("Cart response:", res.data);

      const cartData = res.data;
      setCart(cartData);
      setCartItems([...res.data.items]);
      return cartData;
    } catch (error: any) {
      console.error("Error fetching cart:", error);

      // Don't show toast for CORS/preflight errors
      if (
        error.message?.includes("Network Error") ||
        error.code === "NETWORK_ERROR"
      ) {
        console.log("Network error, might be CORS related");
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load cart",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      const headers = await getAuthHeaders();
      const res = await api.post(
        "/cart/add/",
        {
          product: productId,
          quantity,
        },
        { headers }
      );

      await getCart(); // refresh cart after adding
      Toast.show({
        type: "success",
        text1: "Added to Cart",
        text2: "Item added to your cart successfully",
      });
      return res.data;
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to add item to cart";
      Toast.show({
        type: "error",
        text1: "Adding to Cart Failed",
        text2: errorMessage,
      });
      throw error;
    }
  };

  const updateCartItem = async (id: number, quantity: number) => {
    try {
      const headers = await getAuthHeaders();
      const res = await api.patch(
        `/cart/items/${id}/update/`,
        { quantity },
        { headers }
      );
      await getCart(); // refresh cart after update

      if (quantity === 0) {
        Toast.show({
          type: "success",
          text1: "Item Removed",
          text2: "Item has been removed from your cart",
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Cart Updated",
          text2: "Cart item quantity updated",
        });
      }

      return res.data;
    } catch (error: any) {
      console.error("Error updating cart item:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to update cart item";
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: errorMessage,
      });
      // throw error;
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      const headers = await getAuthHeaders();
      await api.delete(`/cart/items/${id}/remove/`, { headers });
      await getCart(); // refresh cart after removal
      Toast.show({
        type: "success",
        text1: "Item Removed",
        text2: "Item has been removed from your cart",
      });
    } catch (error: any) {
      console.error("Error removing from cart:", error);
      Toast.show({
        type: "error",
        text1: "Remove Failed",
        text2: "Failed to remove item from cart",
      });
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const headers = await getAuthHeaders();
      // Remove all items one by one
      await Promise.all(
        cartItems.map((item) =>
          api.delete(`/cart/items/${item.id}/remove/`, { headers })
        )
      );
      await getCart(); // refresh cart
      Toast.show({
        type: "success",
        text1: "Cart Cleared",
        text2: "All items have been removed from your cart",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      Toast.show({
        type: "error",
        text1: "Clear Failed",
        text2: "Failed to clear cart",
      });
      throw error;
    }
  };

  const mergeCarts = async () => {
    try {
      const headers = await getAuthHeaders();
      const sessionK = await storage.getItem("cart_session_key");

      await api.post("/cart/merge/", { session_key: sessionK }, { headers });
      await getCart(); // refresh cart after merge
      Toast.show({
        type: "success",
        text1: "Cart Merged",
        text2: "Your session cart has been merged with your account",
      });

      // Clear session key after successful merge
      await storage.removeItem("cart_session_key");
      setSessionKey(null);
    } catch (error) {
      console.error("Error merging carts:", error);
    }
  };

  // Clear session key on logout
  useEffect(() => {
    const clearSessionOnLogout = async () => {
      if (!user && sessionKey) {
        await storage.removeItem("cart_session_key");
        setSessionKey(null);
      }
    };

    clearSessionOnLogout();
  }, [user]);

  // Calculate cart totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product_detail?.price || 0) * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Load cart when user changes (login/logout) or session key changes
  useEffect(() => {
    getCart();
  }, [user]);

  // Initialize session key on mount
  useEffect(() => {
    const initializeSession = async () => {
      if (!user) {
        await getOrCreateSessionKey();
      }
    };
    initializeSession();
  }, []);

  return {
    cart, // Full cart object with totals
    cartItems, // Array of cart items
    loading,
    subtotal,
    totalItems,
    sessionKey,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCart,
    mergeCarts,
  };
};
