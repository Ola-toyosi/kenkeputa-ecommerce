import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";
import Toast from "react-native-toast-message";

export interface ProductType {
  id?: number;
  title: string;
  category: string;
  price: number;
  inventory_count: number;
  description?: string;
  image_url?: string; // stored backend URL
  image?: {
    uri: string;
    name?: string;
    type?: string;
  }; // local picked image
}

interface AdminProductsContextType {
  products: ProductType[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  createProduct: (formData: FormData) => Promise<void>;
  updateProduct: (formData: FormData, id: number) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

const AdminProductsContext = createContext<AdminProductsContextType | null>(
  null
);

export const AdminProductsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/");
      setProducts(res.data.results);
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Failed to fetch products",
        text2: "Refresh your page",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (formData: FormData) => {
    try {
      const res = await api.post("/products/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts((prev) => [res.data, ...prev]);
      Toast.show({
        type: "success",
        text1: "Product created successfully",
        text2: "Your product is now listed on Kenkeputa",
      });
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Failed to create product",
        text2: "Try again",
      });
    }
  };

  const updateProduct = async (formData: FormData, id: number) => {
    try {
      //   formData.forEach((value, key) => {
      //     console.log(key, value);
      //   });

      const res = await api.put(`/products/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)));

      Toast.show({
        type: "success",
        text1: "Product updated successfully",
        text2: "Product details have been updated",
      });
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Failed to update product",
        text2: "Try again later!",
      });
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await api.delete(`/products/${id}/`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      Toast.show({
        type: "success",
        text1: "Product deleted successfully",
        text2: "Product deleted from database",
      });
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Failed to delete product",
        text2: "Try again later!",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <AdminProductsContext.Provider
      value={{
        products,
        loading,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </AdminProductsContext.Provider>
  );
};

export const useAdminProducts = () => {
  const context = useContext(AdminProductsContext);
  if (!context) {
    throw new Error(
      "useAdminProducts must be used within AdminProductsProvider"
    );
  }
  return context;
};
