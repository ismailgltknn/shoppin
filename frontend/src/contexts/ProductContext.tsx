import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import axiosInstance from "../api/axiosInstance";
import type { Product } from "../types";
import { toast } from "react-hot-toast";

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  links: Array<{
    url?: string;
    label: string;
    active: boolean;
  }>;
  next_page_url?: string;
  path: string;
  per_page: number;
  prev_page_url?: string;
  to: number;
  total: number;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalProducts: number;
  fetchProducts: (page?: number, rowsPerPage?: number) => Promise<void>;
  addProduct: (productData: FormData) => Promise<boolean>;
  updateProduct: (id: number, productData: FormData) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (page: number = 0, rowsPerPage: number = 10) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<PaginatedResponse<Product>>(
          `/products?page=${page + 1}&per_page=${rowsPerPage}`
        );
        setProducts(response.data.data);
        setTotalProducts(response.data.total);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Ürünler yüklenirken bir hata oluştu.");
        toast.error("Ürünler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addProduct = async (productData: FormData): Promise<boolean> => {
    setLoading(true);
    try {
      await axiosInstance.post<Product>("/products", productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchProducts(0, 10);
      toast.success("Ürün başarıyla eklendi!");
      return true;
    } catch (err) {
      console.error("Error adding product:", err);
      setError("Ürün eklenirken hata oluştu.");
      toast.error("Ürün eklenemedi!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    id: number,
    productData: FormData
  ): Promise<boolean> => {
    setLoading(true);
    try {
      await axiosInstance.post<Product>(`/products/${id}`, productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchProducts();
      toast.success("Ürün başarıyla güncellendi!");
      return true;
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Ürün güncellenirken hata oluştu.");
      toast.error("Ürün güncellenemedi!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/products/${id}`);
      toast.success("Ürün başarıyla silindi!");
      return true;
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Ürün silinirken bir hata oluştu.");
      toast.error("Ürün silinemedi!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    products,
    loading,
    error,
    totalProducts,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};
