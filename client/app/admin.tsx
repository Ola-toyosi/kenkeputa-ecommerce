import React, { useCallback, useState } from "react";
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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useAdminProducts, ProductType } from "./context/ProductsContext";
import * as ImagePicker from "expo-image-picker";
import CustomSafeAreaView from "@/components/view/SafeAreaView";

export default function AdminProductsScreen() {
  const router = useRouter();
  const {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useAdminProducts();
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

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, []) // Add dependency
  );

  const openModal = (product?: ProductType) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        ...product,
        image_url: product.image_url || "",
      });
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
      fetchProducts();
    } catch (err) {
      console.error("Submit error", err);
    }
  };

  const pickImage = async () => {
    try {
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

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        let fileName = "product.jpg";
        if (asset.uri) {
          const uriParts = asset.uri.split("/");
          fileName = uriParts[uriParts.length - 1];
        }

        const imageData = {
          uri: asset.uri,
          name: fileName,
          type: "image/jpeg", // Simplified type handling
        };

        setForm({
          ...form,
          image: imageData,
          image_url: asset.uri,
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e86de" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomSafeAreaView>
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
        {/* Products List */}
        <FlatList
          data={products}
          keyExtractor={(item) => item.id!.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
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
              <View style={styles.productInfo}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.detail}>
                  Category: {item.category || "N/A"}
                </Text>
                <Text style={styles.detail}>
                  Price: ${Number(item.price).toFixed(2)}
                </Text>
                <Text style={styles.detail}>Stock: {item.inventory_count}</Text>
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={() => openModal()}
              >
                <Text style={styles.addFirstButtonText}>
                  Add Your First Product
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
        {/* Modal for Create/Edit */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          statusBarTranslucent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalWrapper}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingProduct ? "Edit Product" : "Add Product"}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Body with Scroll */}
              <KeyboardAvoidingView
                style={styles.modalBody}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
              >
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollViewContent}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Title */}
                  <Text style={styles.label}>Title *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.title}
                    onChangeText={(t) => setForm({ ...form, title: t })}
                    placeholder="Enter product title"
                  />

                  {/* Category */}
                  <Text style={styles.label}>Category *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.category}
                    onChangeText={(t) => setForm({ ...form, category: t })}
                    placeholder="Enter product category"
                  />

                  {/* Price */}
                  <Text style={styles.label}>Price ($) *</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={form.price === 0 ? "" : form.price.toString()}
                    onChangeText={(t) =>
                      setForm({ ...form, price: parseFloat(t) || 0 })
                    }
                    placeholder="0.00"
                  />

                  {/* Stock */}
                  <Text style={styles.label}>Stock *</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={
                      form.inventory_count === 0
                        ? ""
                        : form.inventory_count.toString()
                    }
                    onChangeText={(t) =>
                      setForm({ ...form, inventory_count: parseInt(t) || 0 })
                    }
                    placeholder="0"
                  />

                  {/* Description */}
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={4}
                    value={form.description}
                    onChangeText={(t) => setForm({ ...form, description: t })}
                    placeholder="Enter product description"
                    textAlignVertical="top"
                  />

                  {/* Image Upload */}
                  <Text style={styles.label}>Product Image</Text>
                  {form.image_url ? (
                    <Image
                      source={{ uri: form.image_url }}
                      style={styles.imagePreview}
                    />
                  ) : null}
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={pickImage}
                  >
                    <Text style={styles.uploadButtonText}>
                      {form.image_url ? "Change Image" : "Upload Image"}
                    </Text>
                  </TouchableOpacity>

                  {/* Actions */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.saveButton]}
                      onPress={handleSubmit}
                    >
                      <Text style={styles.modalButtonText}>
                        {editingProduct ? "Update" : "Save"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </View>
        </Modal>
      </CustomSafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    color: "#333",
  },
  detail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  actions: {
    flexDirection: "row",
    marginTop: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  editButton: {
    backgroundColor: "#2e86de",
  },
  deleteButton: {
    backgroundColor: "#c0392b",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  addFirstButton: {
    backgroundColor: "#2e86de",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Modal Styles - CLEANED UP
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalWrapper: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    minHeight: "50%", // Ensure minimum height
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1, // CRITICAL FIX - This was missing
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginBottom: 12,
    borderRadius: 8,
    alignSelf: "center",
  },
  uploadButton: {
    backgroundColor: "#2e86de",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
  },
  saveButton: {
    backgroundColor: "#27ae60",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
