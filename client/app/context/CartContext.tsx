import { useCart } from "@/hooks/use-cart";
import { createContext, ReactNode, useContext } from "react";

interface CartProviderProps {
  children: ReactNode;
}
const CartContext = createContext<any>(null);

export function CartProvider({ children }: CartProviderProps) {
  const cart = useCart();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  return useContext(CartContext);
}
