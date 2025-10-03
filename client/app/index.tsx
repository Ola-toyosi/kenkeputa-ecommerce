import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "@/types/models";
import api from "./api/api";
import { AuthContext } from "./context/AuthContext";
import CustomSafeAreaView from "@/components/view/SafeAreaView";

const { width } = Dimensions.get("window");

const FEATURED_CATEGORIES = [
  {
    id: 1,
    name: "Electronics",
    icon: "phone-portrait",
    color: "#9b51e0",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop",
    description: "Latest gadgets and devices",
  },
  {
    id: 2,
    name: "Home & Kitchen",
    icon: "home",
    color: "#2ed573",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
    description: "Everything for your home",
  },
  {
    id: 3,
    name: "Fashion",
    icon: "shirt",
    color: "#ffa502",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop",
    description: "Trendy clothes & accessories",
  },
  {
    id: 4,
    name: "Sports",
    icon: "basketball",
    color: "#1e90ff",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
    description: "Fitness gear & equipment",
  },
  {
    id: 5,
    name: "Beauty",
    icon: "sparkles",
    color: "#ff6b81",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop",
    description: "Skincare & cosmetics",
  },
  {
    id: 6,
    name: "Books",
    icon: "book",
    color: "#a55eea",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop",
    description: "Books & stationery",
  },
];

export default function WelcomeScreen() {
  const { user, checkAuth } = useContext(AuthContext);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      await checkAuth();
    };
    verifyUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [user]); // fetch products whether logged in or not

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async (): Promise<void> => {
    try {
      const [featuredRes, trendingRes] = await Promise.all([
        api.get("/products/?limit=6"),
        api.get("/products/?limit=8"),
      ]);

      const featured = featuredRes.data.results || featuredRes.data;
      const trending = trendingRes.data.results || trendingRes.data;

      setFeaturedProducts(Array.isArray(featured) ? featured.slice(0, 6) : []);
      setTrendingProducts(Array.isArray(trending) ? trending.slice(0, 8) : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback mock data
      setFeaturedProducts([]);
      setTrendingProducts([]);
    } finally {
      setLoadingProducts(false);
      setLoading(false);
    }
  };

  const renderCategoryCard = (category: (typeof FEATURED_CATEGORIES)[0]) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => router.push(`/products?category=${category.name}`)}
    >
      <Image source={{ uri: category.image }} style={styles.categoryImage} />
      <View style={styles.categoryOverlay}>
        <View
          style={[styles.categoryIcon, { backgroundColor: category.color }]}
        >
          <Ionicons name={category.icon as any} size={20} color="#fff" />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductCard = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => router.push(`/products/${product.id}`)}
    >
      <Image
        source={{
          uri:
            product.image_url ||
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&h=150&fit=crop",
        }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.productPrice}>
          ${Number(product.price).toFixed(2)}
        </Text>
        <View style={styles.productRating}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>4.8</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTrendingProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.trendingProductCard}
      onPress={() => router.push(`/products/${item.id}`)}
    >
      <Image
        source={{
          uri:
            item.image_url ||
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=120&h=120&fit=crop",
        }}
        style={styles.trendingProductImage}
        resizeMode="cover"
      />
      <View style={styles.trendingProductInfo}>
        <Text style={styles.trendingProductName} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.trendingProductPrice}>
          ${Number(item.price).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading || loadingProducts) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9b51e0" />
      </View>
    );
  }

  return (
    <CustomSafeAreaView>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {user ? (
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Welcome back, {user.username} 👋
              </Text>
              <Text style={styles.heroSubtitle}>
                Here are some picks for you
              </Text>
            </View>
          ) : (
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Welcome to{"\n"}Kenkeputa</Text>
              <Text style={styles.heroSubtitle}>
                Discover amazing products at unbeatable prices. Shop the latest
                trends with fast delivery and secure payments.
              </Text>

              <View style={styles.heroImageContainer}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=400&h=300&fit=crop",
                  }}
                  style={styles.heroImage}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push("/(auth)/signup")}
                >
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push("/(auth)/login")}
                >
                  <Text style={styles.secondaryButtonText}>
                    I have an account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Featured Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => router.push("/products")}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {FEATURED_CATEGORIES.slice(0, 4).map(renderCategoryCard)}
          </View>
        </View>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
              <TouchableOpacity onPress={() => router.push("/products")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredProductsScroll}
            >
              {featuredProducts.map(renderProductCard)}
            </ScrollView>
          </View>
        )}

        {/* All Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>More Categories</Text>
            <TouchableOpacity onPress={() => router.push("/products")}>
              <Text style={styles.seeAllText}>Explore</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {FEATURED_CATEGORIES.slice(4).map(renderCategoryCard)}
          </View>
        </View>

        {/* Trending Products */}
        {trendingProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Now</Text>
              <TouchableOpacity onPress={() => router.push("/products")}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={trendingProducts}
              renderItem={renderTrendingProduct}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.trendingGrid}
              columnWrapperStyle={styles.trendingColumnWrapper}
            />
          </View>
        )}

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose Kenkeputa?</Text>

          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: "rgba(155, 81, 224, 0.1)" },
                ]}
              >
                <Ionicons name="shield-checkmark" size={32} color="#9b51e0" />
              </View>
              <Text style={styles.featureTitle}>Secure Shopping</Text>
              <Text style={styles.featureDescription}>
                Your data and payments are protected with bank-level security
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: "rgba(46, 213, 115, 0.1)" },
                ]}
              >
                <Ionicons name="rocket" size={32} color="#2ed573" />
              </View>
              <Text style={styles.featureTitle}>Fast Delivery</Text>
              <Text style={styles.featureDescription}>
                Get your orders delivered in 2-3 business days
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: "rgba(255, 165, 2, 0.1)" },
                ]}
              >
                <Ionicons name="headset" size={32} color="#ffa502" />
              </View>
              <Text style={styles.featureTitle}>24/7 Support</Text>
              <Text style={styles.featureDescription}>
                Our support team is always here to help you
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: "rgba(30, 144, 255, 0.1)" },
                ]}
              >
                <Ionicons name="refresh" size={32} color="#1e90ff" />
              </View>
              <Text style={styles.featureTitle}>Easy Returns</Text>
              <Text style={styles.featureDescription}>
                Not happy? Return within 30 days, no questions asked
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          {user ? (
            <>
              <Text style={styles.ctaTitle}>
                Welcome back, {user.username}! 🎉
              </Text>
              <Text style={styles.ctaSubtitle}>
                What would you like to do today?
              </Text>

              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push("/cart")}
              >
                <Text style={styles.ctaButtonText}>Go to Cart</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ctaButton]}
                onPress={() => router.push("/profile")}
              >
                <Text style={styles.ctaButtonText}>View Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.ctaTitle}>Ready to Start Shopping?</Text>
              <Text style={styles.ctaSubtitle}>
                Join thousands of happy customers shopping on Kenkeputa
              </Text>

              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push("/(auth)/signup")}
              >
                <Text style={styles.ctaButtonText}>Create Account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => router.push("/(auth)/login")}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account?{" "}
                  <Text style={styles.loginLinkBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </CustomSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: "#f8f8f8",
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 42,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  heroImageContainer: {
    width: width - 48,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9b51e0",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#9b51e0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#9b51e0",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#9b51e0",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginVertical: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  seeAllText: {
    fontSize: 14,
    color: "#9b51e0",
    fontWeight: "600",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: (width - 52) / 2,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    marginBottom: 8,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  categoryDescription: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    textAlign: "center",
  },
  featuredProductsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  productCard: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9b51e0",
    marginBottom: 4,
  },
  productRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  trendingGrid: {
    paddingHorizontal: 20,
  },
  trendingColumnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  trendingProductCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 160,
  },
  trendingProductImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  trendingProductInfo: {
    flex: 1,
  },
  trendingProductName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
    lineHeight: 16,
  },
  trendingProductPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#9b51e0",
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: "#fff",
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
    backgroundColor: "#fafafa",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: "#9b51e0",
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  ctaSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonText: {
    color: "#9b51e0",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    padding: 8,
  },
  loginLinkText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  loginLinkBold: {
    color: "#fff",
    fontWeight: "bold",
  },
});
