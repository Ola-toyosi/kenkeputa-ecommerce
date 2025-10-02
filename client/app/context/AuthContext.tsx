import React, { createContext, useState, ReactNode } from "react";
import api from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCartContext } from "./CartContext";

// Type definitions
export interface User {
  id: string;
  email: string;
  username: string;
  is_admin: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface LoginResponse {
  user: User;
  refresh: string;
  access: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  role: "customer" | "vendor";
}

export interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  isLoading: false,
  checkAuth: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const { mergeCarts } = useCartContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check if user is already authenticated on app start
  const checkAuth = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        // Verify token is still valid by fetching user data
        const response = await api.get("/auth/me/");
        setUser(response.data);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Token is invalid, clear storage
      await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post<LoginResponse>("/auth/token/", {
        email,
        password,
      });

      const { access, refresh } = response.data;

      // Store tokens
      await AsyncStorage.setItem("access_token", access);
      await AsyncStorage.setItem("refresh_token", refresh);

      // Fetch user info
      await checkAuth();

      // Merge guest cart into user cart
      await mergeCarts();

      return true;
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.detail || "Login failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post<LoginResponse>("/auth/signup/", data);

      const { access, refresh } = response.data;

      // Store tokens
      await AsyncStorage.setItem("access_token", access);
      await AsyncStorage.setItem("refresh_token", refresh);

      // Fetch user info
      await checkAuth();
      return true;
    } catch (err: any) {
      console.error("Registration error:", err);

      // Handle different error responses
      if (err.response?.data?.email) {
        throw new Error("Email already exists");
      } else if (err.response?.data?.username) {
        throw new Error("Username already exists");
      } else {
        const errorMessage =
          err.response?.data?.detail || "Registration failed";
        throw new Error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear tokens from storage
      await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
      setUser(null);
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value: AuthContextProps = {
    user,
    login,
    register,
    logout,
    isLoading,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
