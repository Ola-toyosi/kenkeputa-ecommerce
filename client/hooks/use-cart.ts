import api from "@/app/api/api";
import { AuthContext } from "@/app/context/AuthContext";
import { useState, useContext, useEffect } from "react";
import Toast from "react-native-toast-message";

export const useCart = () => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getCart = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cart/");
      setCartItems(res.data.results);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    const res = await api.post("/cart/", { product: productId, quantity });
    await getCart(); // refresh cart after adding
    return res.data;
  };

  const updateCartItem = async (id: number, quantity: number) => {
    try {
      const res = await api.patch(`/cart/${id}/`, { quantity });
      await getCart(); // refresh cart after update
      return res.data;
    } catch (error) {
      console.error("Error updating cart item:", error);
      Toast.show({
        type: "error",
        text1: "Adding to Cart Failed",
        text2: `${error}`,
      });
    }
  };

  const removeFromCart = async (id: number) => {
    await api.delete(`/cart/${id}/`);
    await getCart(); // refresh cart after removal
  };

  const clearCart = async () => {
    await Promise.all(cartItems.map((item) => removeFromCart(item.id)));
    setCartItems([]);
  };

  useEffect(() => {
    if (user) getCart(); // load cart when user logs in
  }, [user]);

  return {
    cartItems,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCart,
  };
};
