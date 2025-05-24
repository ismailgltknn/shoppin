import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface AddToCartPayload {
  productId: number;
  quantity: number;
}

interface OrderItemFromApi {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  created_at: string;
  updated_at: string;
  product: {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: string;
    stock: number;
    image: string;
    created_at: string;
    updated_at: string;
  };
}

interface ApiCartResponse {
  id?: number;
  user_id?: number;
  order_date?: string;
  total_price?: number;
  order_status?: string;
  shipping_address?: string | null;
  billing_address?: string | null;
  created_at?: string;
  updated_at?: string;
  order_items?: OrderItemFromApi[];
}

interface CartContextType {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  decreaseQuantity: (productId: number) => Promise<void>;
  getTotalCount: () => number;
  getTotalPrice: () => number;
  loadingCart: boolean;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  const transformApiResponseToCartItems = (
    data: ApiCartResponse | CartItem[]
  ): CartItem[] => {
    if (
      Array.isArray(data) &&
      data.every((item) => "productId" in item && "name" in item)
    ) {
      return data.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        price: parseFloat(item.price),
        image: item.image,
        quantity: item.quantity,
      }));
    } else if (
      data &&
      typeof data === "object" &&
      Array.isArray((data as ApiCartResponse).order_items)
    ) {
      return (data as ApiCartResponse).order_items!.map(
        (item: OrderItemFromApi) => ({
          productId: item.product_id,
          name: item.product.name,
          price: parseFloat(item.product.price),
          image: item.product.image,
          quantity: item.quantity,
        })
      );
    }
    return [];
  };

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/cart");
      setCartItems(transformApiResponseToCartItems(res.data));
    } catch (error) {
      console.error("Sepet alınamadı:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      setLoading(false);
      setCartItems([]);
    }
  }, [isLoggedIn, fetchCart]);

  const addToCart = async (payload: AddToCartPayload) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post("/cart", payload);
      setCartItems(transformApiResponseToCartItems(res.data));
    } catch (error) {
      console.error("Ürün sepete eklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      setLoading(true);
      const res = await axiosInstance.delete(`/cart/${productId}`);
      setCartItems(transformApiResponseToCartItems(res.data));
    } catch (error) {
      console.error("Ürün silinemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete("/cart");
      setCartItems([]);
    } catch (error) {
      console.error("Sepet temizlenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      setLoading(true);
      const res = await axiosInstance.put(`/cart/${productId}`, { quantity });
      setCartItems(transformApiResponseToCartItems(res.data));
    } catch (error) {
      console.error("Adet güncellenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const decreaseQuantity = async (productId: number) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;

    if (item.quantity === 1) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, item.quantity - 1);
    }
  };

  const getTotalCount = () => {
    return Array.isArray(cartItems)
      ? cartItems.reduce((total, item) => total + item.quantity, 0)
      : 0;
  };

  const getTotalPrice = () => {
    return Array.isArray(cartItems)
      ? cartItems.reduce((total, item) => total + item.quantity * item.price, 0)
      : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        decreaseQuantity,
        getTotalCount,
        getTotalPrice,
        loadingCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
