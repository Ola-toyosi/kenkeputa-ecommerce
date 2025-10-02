import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "../api/api";
import { Ionicons } from "@expo/vector-icons";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}/`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading)
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;

  if (!order)
    return (
      <Text style={{ marginTop: 50, textAlign: "center" }}>
        Order not found
      </Text>
    );

  return (
    <View style={{ flex: 1, padding: 15 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.id}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text>Status: {order.status}</Text>
        <Text>Total: ${Number(order.total_price).toFixed(2)}</Text>
        <Text>
          Shipping Address: {order.shipping_address || "Not provided"}
        </Text>
        <Text>Placed on: {new Date(order.created_at).toLocaleString()}</Text>
      </View>

      <Text style={styles.subHeading}>Items:</Text>
      <FlatList
        data={order.items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text>
              {item.quantity} x {item.product.title}
            </Text>
            <Text>Price: ${Number(item.price).toFixed(2)}</Text>
            <Text>Subtotal: ${(item.quantity * item.price).toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  infoSection: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  itemCard: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    marginBottom: 8,
  },
});
