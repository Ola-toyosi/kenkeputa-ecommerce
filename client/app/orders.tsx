import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import api from "./api/api";
import { Ionicons } from "@expo/vector-icons";

interface OrderItemType {
  id: number;
  product: { id: number; title: string };
  quantity: number;
  price: number;
}

interface OrderType {
  id: number;
  created_at: string;
  total_price: number;
  status: string;
  items: OrderItemType[];
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/");
        setOrders(res.data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading)
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {!orders.length ? (
        <Text style={{ marginTop: 50, textAlign: "center" }}>
          No orders yet
        </Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.orderCard}
              onPress={() => router.push(`/orders/${item.id}`)}
            >
              <Text style={styles.orderTitle}>Order #{item.id}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Total: ${Number(item.total_price).toFixed(2)}</Text>
              <Text>Items: {item.items.length}</Text>
              <Text>Placed: {new Date(item.created_at).toLocaleString()}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    elevation: 3,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  orderCard: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  orderTitle: { fontWeight: "bold", marginBottom: 5 },
});
