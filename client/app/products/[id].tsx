import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Product, CartItem as CartItemType } from "@/types/models";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";
import Toast from "react-native-toast-message";
import { useCart } from "@/hooks/use-cart";
import { useCartContext } from "../context/CartContext";

const { width } = Dimensions.get("window");

const ProductDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  const { cartItems, updateCartItem } = useCartContext();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Mock product images - in real app, this would come from API
  const productImages = [
    product?.image_url ||
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1605360018671-6ce887845e78?w=800&h=600&fit=crop",
  ];

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async (): Promise<void> => {
      try {
        const res = await api.get(`/products/${id}/`);
        setProduct(res.data.product || res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        Alert.alert("Error", "Failed to load product details.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (cartItems && product) {
      const existingItem = cartItems.find(
        (item: CartItemType) =>
          (item.product ?? item.product_detail?.id) === product.id
      );
      if (existingItem) {
        setQuantity(existingItem.quantity);
      }
    }
  }, [cartItems, product]);

  const handleAddToCart = async (): Promise<void> => {
    if (!product) return;

    const safeQuantity = Math.min(quantity, product.inventory_count);

    if (safeQuantity < quantity) {
      Toast.show({
        type: "info",
        text1: "Stock adjusted",
        text2: `Quantity reduced to ${safeQuantity} due to stock limits.`,
      });
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id, safeQuantity);
      Toast.show({
        type: "success",
        text1: "Added to Cart 🛒",
        text2: `${product.title} has been added to your cart.`,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Add",
        text2: err.message || "Something went wrong.",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = (): void => {
    if (!product) return;
    const newQuantity = Math.min(quantity + 1, product.inventory_count);
    setQuantity(newQuantity);
    const existingItem = cartItems.find(
      (item: CartItemType) =>
        (item.product ?? item.product_detail?.id) === product.id
    );
    if (existingItem) {
      updateCartItem(existingItem.id, newQuantity);
    }
  };

  const decrementQuantity = (): void => {
    if (!product) return;
    const newQuantity = Math.max(1, quantity - 1);
    setQuantity(newQuantity);
    const existingItem = cartItems.find(
      (item: CartItemType) =>
        (item.product ?? item.product_detail?.id) === product.id
    );
    if (existingItem) {
      updateCartItem(existingItem.id, newQuantity);
    }
  };

  const handleQuantityChange = (text: string): void => {
    if (!product) return;

    let num = parseInt(text, 10);

    if (isNaN(num) || num <= 0) {
      num = 1; // fallback
    } else if (num > product.inventory_count) {
      num = product.inventory_count; // cap at stock
      Toast.show({
        type: "info",
        text1: "Stock limit",
        text2: `Maximum available: ${product.inventory_count}`,
      });
    }

    setQuantity(num);
    updateCartItem(product.id, num);
  };

  const isOutOfStock = product?.inventory_count === 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9b51e0" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorText}>
          The product you&apos;re looking for doesn&apos;t exist.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Product Image Carousel */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: productImages[activeImageIndex] }}
            style={styles.productImage}
            resizeMode="cover"
          />

          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {productImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.imageIndicator,
                  activeImageIndex === index && styles.imageIndicatorActive,
                ]}
              />
            ))}
          </View>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          {/* Category Badge */}
          {product.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
          )}

          {/* Product Name */}
          <Text style={styles.productName}>{product.title}</Text>

          {/* Rating and Reviews */}
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= 4.5 ? "star" : "star-half"}
                  size={16}
                  color="#FFD700"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>4.8 (127 reviews)</Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {!isOutOfStock && product.inventory_count < 10 && (
              <Text style={styles.lowStockWarning}>
                Only {product.inventory_count} left in stock!
              </Text>
            )}
          </View>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            <Ionicons
              name={isOutOfStock ? "close-circle" : "checkmark-circle"}
              size={20}
              color={isOutOfStock ? "#ff4757" : "#2ed573"}
            />
            <Text
              style={[
                styles.stockText,
                { color: isOutOfStock ? "#ff4757" : "#2ed573" },
              ]}
            >
              {isOutOfStock ? "Out of stock" : "In stock"}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {product.description ||
                "No description available for this product."}
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2ed573" />
                <Text style={styles.featureText}>
                  Premium quality materials
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2ed573" />
                <Text style={styles.featureText}>1-year warranty included</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2ed573" />
                <Text style={styles.featureText}>Free shipping available</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2ed573" />
                <Text style={styles.featureText}>
                  Easy returns within 30 days
                </Text>
              </View>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity === 1 && styles.quantityButtonDisabled,
                ]}
                onPress={decrementQuantity}
                disabled={quantity === 1 || isOutOfStock}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={quantity === 1 || isOutOfStock ? "#ccc" : "#666"}
                />
              </TouchableOpacity>

              <TextInput
                style={[
                  styles.quantityInput,
                  isOutOfStock && styles.quantityInputDisabled,
                ]}
                value={quantity.toString()}
                keyboardType="number-pad"
                onChangeText={handleQuantityChange}
                selectTextOnFocus
                editable={!isOutOfStock}
              />

              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  (quantity >= (product?.inventory_count || 0) ||
                    isOutOfStock) &&
                    styles.quantityButtonDisabled,
                ]}
                onPress={incrementQuantity}
                disabled={
                  quantity >= (product?.inventory_count || 0) || isOutOfStock
                }
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={
                    quantity >= (product?.inventory_count || 0) || isOutOfStock
                      ? "#ccc"
                      : "#666"
                  }
                />
              </TouchableOpacity>
            </View>
            {!isOutOfStock && (
              <Text style={styles.quantityNote}>
                Maximum {product.inventory_count} items per order
              </Text>
            )}
          </View>

          {/* Shipping Info */}
          <View style={styles.shippingSection}>
            <View style={styles.shippingItem}>
              <Ionicons name="rocket-outline" size={20} color="#9b51e0" />
              <View style={styles.shippingText}>
                <Text style={styles.shippingTitle}>Free Shipping</Text>
                <Text style={styles.shippingSubtitle}>
                  Delivery in 2-3 business days
                </Text>
              </View>
            </View>
            <View style={styles.shippingItem}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#9b51e0"
              />
              <View style={styles.shippingText}>
                <Text style={styles.shippingTitle}>Secure Payment</Text>
                <Text style={styles.shippingSubtitle}>
                  Your data is protected
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            ${((product.price || 0) * quantity).toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            (isOutOfStock || addingToCart) && styles.addToCartButtonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={isOutOfStock || addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="cart" size={20} color="#fff" />
              <Text style={styles.addToCartText}>
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  backButtonText: {
    fontSize: 16,
    color: "#9b51e0",
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  scrollView: {
    flex: 1,
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  shareButton: {
    padding: 8,
  },
  imageContainer: {
    position: "relative",
    height: width * 0.8,
    backgroundColor: "#f8f8f8",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  imageIndicatorActive: {
    backgroundColor: "#fff",
    width: 20,
  },
  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  categoryContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
    lineHeight: 32,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stars: {
    flexDirection: "row",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#9b51e0",
  },
  lowStockWarning: {
    fontSize: 14,
    color: "#ff6b6b",
    fontWeight: "500",
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  stockText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 4,
    alignSelf: "flex-start",
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityButtonDisabled: {
    backgroundColor: "#f0f0f0",
  },
  quantityInput: {
    width: 60,
    height: 40,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    backgroundColor: "#fff",
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  quantityInputDisabled: {
    backgroundColor: "#f0f0f0",
    color: "#999",
  },
  quantityNote: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
  shippingSection: {
    marginBottom: 120, // Space for fixed action bar
    gap: 16,
  },
  shippingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
  },
  shippingText: {
    marginLeft: 12,
  },
  shippingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  shippingSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#9b51e0",
  },
  addToCartButton: {
    flex: 2,
    backgroundColor: "#9b51e0",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 16,
    shadowColor: "#9b51e0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#ccc",
    shadowColor: "transparent",
  },
  addToCartText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default ProductDetailScreen;
