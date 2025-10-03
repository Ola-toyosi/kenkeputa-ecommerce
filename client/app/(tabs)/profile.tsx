import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import Toast from "react-native-toast-message";
import ConfirmModal from "@/components/confirm-modal";

const ProfileScreen: React.FC = () => {
  const { user, logout, checkAuth } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await checkAuth();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);

    Toast.show({
      type: "success",
      text1: "Logged out",
      text2: "See you soon 👋",
    });
  };
  const getRoleText = () => {
    if (user?.is_superuser) return "Super Admin";
    if (user?.is_admin) return "Administrator";
    if (user?.is_staff) return "Vendor";
    return "Customer";
  };

  const getRoleColor = () => {
    if (user?.is_superuser) return "#ff6b6b";
    if (user?.is_admin) return "#9b51e0";
    if (user?.is_staff) return "#2ed573";
    return "#666";
  };

  const menuItems = [
    {
      title: "My Orders",
      icon: "receipt-outline",
      onPress: () => router.push("/orders"),
      show: true,
    },
    // {
    //   title: "Admin Panel",
    //   icon: "settings-outline",
    //   onPress: () => router.push("/admin"),
    //   show: user?.is_admin || user?.is_staff,
    // },
    {
      title: "Admin Dashboard",
      icon: "storefront-outline",
      onPress: () => router.push("/admin"),
      show: user?.is_staff,
    },
  ];

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.unauthorizedContainer}>
          <Ionicons name="person-outline" size={80} color="#ccc" />
          <Text style={styles.unauthorizedTitle}>Not Signed In</Text>
          <Text style={styles.unauthorizedText}>
            Please sign in to view your profile
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/profile")}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#9b51e0"]}
            tintColor="#9b51e0"
          />
        }
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#9b51e0" />
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#2ed573" />
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.username || user.email.split("@")[0]}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleColor() + "20" },
              ]}
            >
              <Text style={[styles.roleText, { color: getRoleColor() }]}>
                {getRoleText()}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>User ID</Text>
              <Text style={styles.detailValue}>{user.id}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Account Type</Text>
              <Text style={styles.detailValue}>{getRoleText()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#2ed573" />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailValue}>Recently</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/orders")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#9b51e0" }]}>
                <Ionicons name="cart-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.actionText}>My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/wishlist")}
            >
              <View
                style={[styles.actionIcon, { backgroundColor: "#F60F0FFF" }]}
              >
                <Ionicons name="heart-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.actionText}>Wishlist</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuList}>
            {menuItems
              .filter((item) => item.show)
              .map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name={item.icon as any} size={22} color="#666" />
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.supportButtons}>
            <TouchableOpacity style={styles.supportButton}>
              <Ionicons name="help-circle-outline" size={20} color="#666" />
              <Text style={styles.supportButtonText}>Help Center</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#666" />
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#ff4757" size="small" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#ff4757" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </>
          )}
          <ConfirmModal
            visible={showConfirm}
            title="Logout"
            message="Are you sure you want to logout?"
            onCancel={() => setShowConfirm(false)}
            onConfirm={() => {
              setShowConfirm(false);
              handleLogout();
            }}
          />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Kenkeputa App v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f8f8",
    margin: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarSection: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  detailsGrid: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    color: "#2ed573",
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    width: "48%",
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  menuList: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  supportButtons: {
    gap: 8,
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  supportButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ff4757",
    gap: 8,
  },
  logoutText: {
    color: "#ff4757",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  unauthorizedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  unauthorizedText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  signInButton: {
    backgroundColor: "#9b51e0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;
