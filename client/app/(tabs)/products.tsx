import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Animated,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types/models";
import api from "@/app/api/api";

interface ProductsResponse {
  results: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const { width } = Dimensions.get("window");

// Responsive grid calculation
const getNumColumns = () => {
  if (width > 1024) return 4; // Large tablets/desktop
  if (width > 768) return 3; // Tablets
  if (width > 480) return 2; // Large phones
  return 2; // Small phones
};

const numColumns = getNumColumns();
const CARD_MARGIN = 8;
const CONTAINER_PADDING = 16;
const CARD_WIDTH =
  (width - CONTAINER_PADDING * 2 - (numColumns - 1) * CARD_MARGIN) / numColumns;

export default function ProductListScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    category || "All"
  );
  const [categories, setCategories] = useState<string[]>(["All"]);

  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchProducts = async (): Promise<void> => {
    try {
      const res = await api.get<ProductsResponse>("/products/");
      const productsData = res.data.results || res.data;
      // console.log(productsData);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async (): Promise<void> => {
    try {
      const res = await api.get<{ categories: string[] }>(
        "/products/categories/list"
      );
      const categories =
        res.data.categories?.filter((c) => c && c.trim()) || [];
      setCategories(["All", ...categories]);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories(["All"]); // fallback
    }
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleProductPress = (productId: number): void => {
    router.push(`/products/${productId}`);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productItemWrapper}>
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item.id)}
        cardWidth={CARD_WIDTH}
      />
    </View>
  );

  const renderCategoryChip = (categoryItem: string) => (
    <TouchableOpacity
      key={categoryItem}
      style={[
        styles.categoryChip,
        selectedCategory === categoryItem && styles.categoryChipSelected,
      ]}
      onPress={() => setSelectedCategory(categoryItem)}
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === categoryItem && styles.categoryChipTextSelected,
        ]}
      >
        {categoryItem}
      </Text>
    </TouchableOpacity>
  );

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
      fetchCategories();
    }, [])
  );

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  useEffect(() => {
    const filterProducts = (): void => {
      let filtered = products;

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(
          (product) =>
            product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      }

      // Filter by category
      if (selectedCategory !== "All") {
        filtered = filtered.filter(
          (product) => product.category === selectedCategory
        );
      }

      setFilteredProducts(filtered);
    };
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9b51e0" />
        <Text style={styles.loadingText}>Discovering amazing products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: 100 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Shop</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/cart")}
            >
              <Ionicons name="cart" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categories Scroll */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={({ item }) => renderCategoryChip(item)}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {selectedCategory === "All" ? "All Products" : selectedCategory}
          </Text>
          <Text style={styles.resultsCount}>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
          </Text>
        </View>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsGrid}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#9b51e0"]}
                tintColor="#9b51e0"
              />
            }
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No products found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? `No results for "${searchQuery}"`
                : `No products in ${selectedCategory} category`}
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 60,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 12,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9b51e0",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingTop: 100, // Space for animated header
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  categoryChipSelected: {
    backgroundColor: "#9b51e0",
    borderColor: "#9b51e0",
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  categoryChipTextSelected: {
    color: "#fff",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  resultsCount: {
    fontSize: 14,
    color: "#666",
  },
  productsGrid: {
    paddingHorizontal: CONTAINER_PADDING - CARD_MARGIN,
  },
  productItemWrapper: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: 16,
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: "#9b51e0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
