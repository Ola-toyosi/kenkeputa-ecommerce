import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "@/types/models";

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  cardWidth: number;
}

const { width } = Dimensions.get("window");

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  cardWidth,
}) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = (): void => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (): void => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const isOutOfStock = product.inventory_count === 0;

  // Responsive font sizes based on card width
  const getResponsiveFontSize = (baseSize: number): number => {
    if (cardWidth < 160) return baseSize - 2; // Small cards
    if (cardWidth > 200) return baseSize + 1; // Large cards
    return baseSize; // Medium cards
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
        width: cardWidth,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, isOutOfStock && styles.cardDisabled]}
        disabled={isOutOfStock}
        activeOpacity={0.7}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                product.image_url ||
                "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
            }}
            style={styles.productImage}
            resizeMode="cover"
          />

          {/* Category Badge */}
          {product.category && (
            <View style={styles.categoryBadge}>
              <Text
                style={[
                  styles.categoryText,
                  { fontSize: getResponsiveFontSize(8) },
                ]}
              >
                {product.category}
              </Text>
            </View>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text
                style={[
                  styles.outOfStockText,
                  { fontSize: getResponsiveFontSize(12) },
                ]}
              >
                Out of Stock
              </Text>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={16} color="#fff" />
          </TouchableOpacity>

          {/* Add to Cart Quick Action */}
          {!isOutOfStock && (
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                {
                  width: cardWidth * 0.2,
                  height: cardWidth * 0.2,
                  borderRadius: (cardWidth * 0.2) / 2,
                },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                // Handle quick add to cart
              }}
            >
              <Ionicons name="cart" size={cardWidth * 0.08} color="#9b51e0" />
            </TouchableOpacity>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text
            style={[
              styles.productTitle,
              { fontSize: getResponsiveFontSize(12) },
            ]}
            numberOfLines={2}
          >
            {product.title}
          </Text>

          <View style={styles.priceContainer}>
            <Text
              style={[
                styles.productPrice,
                { fontSize: getResponsiveFontSize(14) },
              ]}
            >
              ${product.price.toFixed(2)}
            </Text>
            {product.inventory_count > 0 && product.inventory_count < 10 && (
              <Text
                style={[
                  styles.lowStockText,
                  { fontSize: getResponsiveFontSize(10) },
                ]}
              >
                Only {product.inventory_count} left!
              </Text>
            )}
          </View>

          {/* Rating and Stock */}
          <View style={styles.footer}>
            <View style={styles.ratingContainer}>
              <Ionicons
                name="star"
                size={getResponsiveFontSize(12)}
                color="#FFD700"
              />
              <Text
                style={[
                  styles.ratingText,
                  { fontSize: getResponsiveFontSize(10) },
                ]}
              >
                4.8
              </Text>
              <Text
                style={[
                  styles.ratingCount,
                  { fontSize: getResponsiveFontSize(10) },
                ]}
              >
                (127)
              </Text>
            </View>

            <View style={styles.stockContainer}>
              <Ionicons
                name={isOutOfStock ? "close-circle" : "checkmark-circle"}
                size={getResponsiveFontSize(12)}
                color={isOutOfStock ? "#ff4757" : "#2ed573"}
              />
              <Text
                style={[
                  styles.stockText,
                  {
                    fontSize: getResponsiveFontSize(10),
                    color: isOutOfStock ? "#ff4757" : "#2ed573",
                  },
                ]}
              >
                {isOutOfStock ? "Out of stock" : "In stock"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },
  cardDisabled: {
    opacity: 0.7,
  },
  imageContainer: {
    position: "relative",
    aspectRatio: 1, // Square aspect ratio
    backgroundColor: "#f8f8f8",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(155, 81, 224, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    color: "#fff",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    color: "#fff",
    fontWeight: "bold",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 6,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productPrice: {
    fontWeight: "bold",
    color: "#9b51e0",
  },
  lowStockText: {
    color: "#ff6b6b",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ratingText: {
    fontWeight: "600",
    color: "#333",
    marginLeft: 2,
    marginRight: 1,
  },
  ratingCount: {
    color: "#666",
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  stockText: {
    fontWeight: "500",
    marginLeft: 2,
  },
  addToCartButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    // padding: 12,
  },
});

export default ProductCard;
