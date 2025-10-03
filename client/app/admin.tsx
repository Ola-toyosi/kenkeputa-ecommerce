import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAdminProducts, ProductType } from "./context/ProductsContext";
import * as ImagePicker from "expo-image-picker";

export default function AdminProductsScreen() {
  const { products, loading, createProduct, updateProduct, deleteProduct } =
    useAdminProducts();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(
    null
  );
  const [form, setForm] = useState<ProductType>({
    title: "",
    category: "",
    price: 0,
    inventory_count: 0,
    description: "",
    image_url: "",
  });
  const router = useRouter();

  const openModal = (product?: ProductType) => {
    if (product) {
      setEditingProduct(product);
      setForm(product);
    } else {
      setEditingProduct(null);
      setForm({
        title: "",
        category: "",
        price: 0,
        inventory_count: 0,
        description: "",
        image_url: "",
      });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("category", form.category);
      formData.append("price", String(form.price));
      formData.append("inventory_count", String(form.inventory_count));
      formData.append("description", form.description || "");

      if (form.image?.uri) {
        // Create a proper file object for FormData
        const imageFile = {
          uri: form.image.uri,
          name: form.image.name || `product_${Date.now()}.jpg`,
          type: form.image.type || "image/jpeg",
        };

        formData.append("image", imageFile as any);
      }

      if (editingProduct?.id) {
        await updateProduct(formData, editingProduct.id);
      } else {
        await createProduct(formData);
      }

      setModalVisible(false);
    } catch (err) {
      console.error("Submit error", err);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        alert("You've refused to allow this app to access your photos!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Extract filename from URI or use default
        let fileName = "product.jpg";
        if (asset.uri) {
          // Extract filename from URI
          const uriParts = asset.uri.split("/");
          fileName = uriParts[uriParts.length - 1];
        }

        const imageData = {
          uri: asset.uri,
          name: fileName,
          type: asset.type === "image" ? "image/jpeg" : `image/${asset.type}`,
        };

        console.log("Selected image:", imageData);

        setForm({
          ...form,
          image: imageData,
          image_url: asset.uri, // Show preview
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  if (loading)
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Products</Text>
        <TouchableOpacity onPress={() => openModal()}>
          <Ionicons name="add-circle" size={28} color="#2e86de" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id!.toString()}
        contentContainerStyle={{ padding: 8, gap: 16 }}
        renderItem={({ item }) => (
          <View style={styles.container}>
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri:
                    item.image_url ||
                    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
                }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text>Category: {item.category || "N/A"}</Text>
              <Text>Price: ${Number(item.price).toFixed(2)}</Text>
              <Text>Stock: {item.inventory_count}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.editButton]}
                  onPress={() => openModal(item)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={() => deleteProduct(item.id!)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* Modal for Create/Edit */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? "Edit Product" : "Add Product"}
            </Text>

            {/* Title */}
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(t) => setForm({ ...form, title: t })}
            />

            {/* Category */}
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={form.category}
              onChangeText={(t) => setForm({ ...form, category: t })}
            />

            {/* Price */}
            <Text style={styles.label}>Price ($)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.price.toString()}
              onChangeText={(t) =>
                setForm({ ...form, price: parseFloat(t) || 0 })
              }
            />

            {/* Stock */}
            <Text style={styles.label}>Stock</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.inventory_count.toString()}
              onChangeText={(t) =>
                setForm({ ...form, inventory_count: parseInt(t) || 0 })
              }
            />

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              value={form.description}
              onChangeText={(t) => setForm({ ...form, description: t })}
            />

            {/* Image Upload */}
            <Text style={styles.label}>Product Image</Text>
            {form.image_url ? (
              <Image
                source={{ uri: form.image_url }}
                style={{
                  width: 100,
                  height: 100,
                  marginBottom: 10,
                  borderRadius: 8,
                }}
              />
            ) : null}
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {form.image_url ? "Change Image" : "Upload Image"}
              </Text>
            </TouchableOpacity>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    elevation: 3,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
    // marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    backgroundColor: "#fff",
    gap: 16,
  },
  card: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    aspectRatio: 1, // Square aspect ratio
    backgroundColor: "#f8f8f8",
    flex: 1,
  },
  productImage: {
    width: "100%",
    height: "100%",
    margin: "auto",
  },
  title: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  actions: { flexDirection: "row", marginTop: 10 },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  editButton: { backgroundColor: "#2e86de" },
  deleteButton: { backgroundColor: "#c0392b" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 10,
  },
  uploadButton: {
    backgroundColor: "#2e86de",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 15,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end" },
});
