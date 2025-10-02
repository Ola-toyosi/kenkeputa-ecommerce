import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "./api/api";
import Toast from "react-native-toast-message";
import { CartItem as CartItemType } from "@/types/models";
import { useCartContext } from "./context/CartContext";
import AddressModal from "@/components/checkout/AddressModal";

const CheckoutScreen: React.FC = () => {
  const { cart, cartItems, getCart } = useCartContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [shippingAddress, setShippingAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  useEffect(() => {
    getCart();
    setIsLoading(false);
  }, []);

  const handleCheckout = async (): Promise<void> => {
    if (!shippingAddress.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please enter your shipping address",
      });
      return;
    }

    setIsPlacingOrder(true);
    try {
      const res = await api.post("/orders/", {
        shippingAddress: shippingAddress.trim(),
      });
      Toast.show({
        type: "success",
        text1: "Order Placed!",
        text2: `Your order #${res.data.id} has been placed successfully.`,
      });
    } catch (error: any) {
      console.error("Checkout error:", error);
      const errorMessage =
        error.response?.data?.error || "Checkout failed. Please try again.";
      Toast.show({
        type: "error",
        text1: "Checkout Failed",
        text2: `${errorMessage}`,
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Fixed subtotal calculation
  const subtotal = cartItems.reduce(
    (sum: number, item: CartItemType) =>
      sum + item.product_detail.price * item.quantity,
    0
  );
  const shippingFee = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingFee + tax;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9b51e0" />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </View>
    );
  }

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>No items to checkout</Text>
        <Text style={styles.emptySubtitle}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.shopButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Checkout</Text>
          <Text style={styles.stepIndicator}>Step 2 of 2</Text>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartItems.map((item: CartItemType) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product_detail.title}{" "}
                  {/* Fixed: product_detail.title */}
                </Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ${(item.product_detail.price * item.quantity).toFixed(2)}{" "}
                {/* Fixed: product_detail.price */}
              </Text>
            </View>
          ))}
        </View>

        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Information</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Shipping Address</Text>
            <View style={styles.textInput}>
              <Text
                style={[
                  styles.inputText,
                  { color: shippingAddress ? "#333" : "#999" },
                ]}
              >
                {shippingAddress || "Enter your complete shipping address"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setAddressModalVisible(true)}
            >
              <Text style={styles.editButtonText}>
                {shippingAddress ? "Edit" : "Add"} Address
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === "card" && styles.paymentMethodSelected,
              ]}
              onPress={() => setPaymentMethod("card")}
            >
              <Ionicons
                name={
                  paymentMethod === "card"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={24}
                color="#9b51e0"
              />
              <Text style={styles.paymentMethodText}>Credit/Debit Card</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === "paypal" && styles.paymentMethodSelected,
              ]}
              onPress={() => setPaymentMethod("paypal")}
            >
              <Ionicons
                name={
                  paymentMethod === "paypal"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={24}
                color="#9b51e0"
              />
              <Text style={styles.paymentMethodText}>PayPal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === "cod" && styles.paymentMethodSelected,
              ]}
              onPress={() => setPaymentMethod("cod")}
            >
              <Ionicons
                name={
                  paymentMethod === "cod"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={24}
                color="#9b51e0"
              />
              <Text style={styles.paymentMethodText}>Cash on Delivery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Total */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Total</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={styles.totalValue}>
              {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
          </View>

          {subtotal < 50 && (
            <Text style={styles.freeShippingNote}>
              Add ${(50 - subtotal).toFixed(2)} more for FREE shipping!
            </Text>
          )}
        </View>

        {/* Checkout Button */}
        <View style={styles.checkoutSection}>
          <TouchableOpacity
            style={[
              styles.placeOrderButton,
              (!shippingAddress || isPlacingOrder) &&
                styles.placeOrderButtonDisabled,
            ]}
            onPress={handleCheckout}
            disabled={!shippingAddress || isPlacingOrder}
          >
            {isPlacingOrder ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.placeOrderButtonText}>Place Order</Text>
                <Ionicons name="lock-closed" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToCart}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#9b51e0" />
            <Text style={styles.backToCartText}>Back to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AddressModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onSave={(addr) => setShippingAddress(addr)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: "#9b51e0",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  stepIndicator: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  inputContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  inputText: {
    fontSize: 16,
  },
  editButton: {
    alignSelf: "flex-end",
  },
  editButtonText: {
    color: "#9b51e0",
    fontSize: 16,
    fontWeight: "500",
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentMethodSelected: {
    borderColor: "#9b51e0",
    backgroundColor: "#f3e9ff",
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginLeft: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
    paddingTop: 12,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#9b51e0",
  },
  freeShippingNote: {
    fontSize: 14,
    color: "#9b51e0",
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
  checkoutSection: {
    padding: 20,
  },
  placeOrderButton: {
    backgroundColor: "#9b51e0",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#9b51e0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  backToCart: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  backToCartText: {
    color: "#9b51e0",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default CheckoutScreen;
