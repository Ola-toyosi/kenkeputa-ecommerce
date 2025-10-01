import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CartItemType {
  id: number;
  quantity: number;
  product_detail: {
    title: string;
    price: string | number;
  };
}

interface CartItemProps {
  item: any;
  onRemove: () => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
}

const CartItem = ({ item, onRemove, onUpdateQuantity }: CartItemProps) => {
  const handleQuantityUpdate = (newQuantity: number) => {
    if (newQuantity >= 1) {
      // Ensure quantity doesn't go below 1
      onUpdateQuantity(item.id, newQuantity);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.product_detail.title}</Text>
        <Text style={styles.price}>
          ${parseFloat(item.product_detail.price).toFixed(2)} each
        </Text>
        <Text style={styles.subtotal}>
          Subtotal: ${(item.product_detail.price * item.quantity).toFixed(2)}
        </Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => handleQuantityUpdate(item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Ionicons name="remove-circle-outline" size={22} color="#9b51e0" />
          </TouchableOpacity>

          <Text style={styles.quantity}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => handleQuantityUpdate(item.quantity + 1)}
          >
            <Ionicons name="add-circle-outline" size={22} color="#9b51e0" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Ionicons name="trash-outline" size={22} color="#ff4d4d" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
    color: "#333",
  },
  price: {
    fontSize: 14,
    color: "#666",
  },
  subtotal: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  qtyButton: {
    paddingHorizontal: 4,
  },
  quantity: {
    marginHorizontal: 6,
    fontSize: 16,
    fontWeight: "500",
  },
  removeButton: {
    padding: 4,
  },
});
