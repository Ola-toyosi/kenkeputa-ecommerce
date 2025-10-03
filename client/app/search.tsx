import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "@/types/models";

const { width } = Dimensions.get("window");

interface SearchResultsResponse {
  results: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const [searchQuery, setSearchQuery] = useState(q || "");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState([
    "Smartphone",
    "Laptop",
    "Headphones",
    "Watch",
    "Camera",
    "Speaker",
    "Tablet",
    "Gaming",
  ]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (q) {
      setSearchQuery(q);
      handleSearch(q);
    }
    loadRecentSearches();
  }, [q]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const loadRecentSearches = async () => {
    // In a real app, you'd load from AsyncStorage
    const recent = ["Wireless Earbuds", "Fitness Tracker", "Coffee Maker"];
    setRecentSearches(recent);
  };

  const saveToRecentSearches = (query: string) => {
    if (!query.trim()) return;

    const updated = [
      query,
      ...recentSearches.filter((item) => item !== query),
    ].slice(0, 5);
    setRecentSearches(updated);
    // In a real app, save to AsyncStorage
  };

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await api.get<SearchResultsResponse>(
        `/products/?search=${encodeURIComponent(query)}`
      );
      const results = res.data.results || res.data;
      setSearchResults(Array.isArray(results) ? results : []);
      saveToRecentSearches(query);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const renderSearchItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => router.push(`/products/${item.id}`)}
    >
      <Image
        source={{
          uri:
            item.image_url ||
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop",
        }}
        style={styles.resultImage}
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.resultCategory}>{item.category}</Text>
        <Text style={styles.resultPrice}>${Number(item.price).toFixed(2)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderSearchSuggestion = (suggestion: string, isRecent = false) => (
    <TouchableOpacity
      key={suggestion}
      style={styles.suggestionItem}
      onPress={() => {
        setSearchQuery(suggestion);
        handleSearch(suggestion);
      }}
    >
      <Ionicons
        name={isRecent ? "time" : "trending-up"}
        size={18}
        color="#666"
      />
      <Text style={styles.suggestionText}>{suggestion}</Text>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            autoFocus={!q}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Search Results or Suggestions */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9b51e0" />
          <Text style={styles.loadingText}>Searching products...</Text>
        </View>
      ) : hasSearched ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.emptyResults}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyResultsTitle}>No products found</Text>
              <Text style={styles.emptyResultsText}>
                We couldn&apos;t find any products matching &ldquo;{searchQuery}
                &rdquo;
              </Text>
              <TouchableOpacity
                style={styles.tryAgainButton}
                onPress={clearSearch}
              >
                <Text style={styles.tryAgainText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          }
          ListHeaderComponent={
            searchResults.length > 0 ? (
              <Text style={styles.resultsCount}>
                Found {searchResults.length}{" "}
                {searchResults.length === 1 ? "product" : "products"}
              </Text>
            ) : null
          }
        />
      ) : (
        <ScrollView
          style={styles.suggestionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsTitle}>Recent Searches</Text>
              <View style={styles.suggestionsList}>
                {recentSearches.map((search) =>
                  renderSearchSuggestion(search, true)
                )}
              </View>
            </View>
          )}

          {/* Popular Searches */}
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>Popular Searches</Text>
            <View style={styles.suggestionsList}>
              {popularSearches.map((search) =>
                renderSearchSuggestion(search, false)
              )}
            </View>
          </View>

          {/* Search Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>Search Tips</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2ed573" />
                <Text style={styles.tipText}>Use specific product names</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2ed573" />
                <Text style={styles.tipText}>Try different keywords</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2ed573" />
                <Text style={styles.tipText}>Check your spelling</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  resultsList: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  resultCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9b51e0",
  },
  emptyResults: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyResultsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  tryAgainButton: {
    backgroundColor: "#9b51e0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  tryAgainText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  suggestionsContainer: {
    flex: 1,
  },
  suggestionsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: "#666",
    marginLeft: 12,
  },
  tipsSection: {
    padding: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
});

// Add ScrollView import at the top
import { ScrollView } from "react-native";
import api from "./api/api";
