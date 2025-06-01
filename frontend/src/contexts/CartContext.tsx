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

interface DirectCartItemFromApi {
  productId: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
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
  const [loadingCart, setLoadingCart] = useState(true);
  const { isLoggedIn, loading: loadingAuth } = useAuth();

  const transformApiResponseToCartItems = useCallback(
    (data: ApiCartResponse | DirectCartItemFromApi[]): CartItem[] => {
      // Case 1: Eğer API yanıtı direkt CartItem dizisi ise (GET isteği gibi)
      if (
        Array.isArray(data) &&
        data.every(
          (item: any) =>
            "productId" in item &&
            "name" in item &&
            "price" in item &&
            "quantity" in item
        )
      ) {
        return data.map((item: DirectCartItemFromApi) => ({
          productId: item.productId,
          name: item.name,
          price: parseFloat(item.price),
          image: item.image,
          quantity: item.quantity,
        }));
      }
      // Case 2: Eğer API yanıtı ApiCartResponse objesi ise (POST/PUT/DELETE sonrası gibi)
      else if (
        data &&
        typeof data === "object" &&
        "order_items" in data &&
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
      console.warn("Beklenmedik API yanıt formatı:", data);
      return []; // Hiçbir formata uymuyorsa boş dizi döndür
    },
    []
  );

  const fetchCart = useCallback(async () => {
    if (loadingAuth) {
      return;
    }

    setLoadingCart(true);
    try {
      if (isLoggedIn) {
        const res = await axiosInstance.get("/cart");
        // fetchCart'ten gelen response'u transformApiResponseToCartItems'a gönder
        setCartItems(transformApiResponseToCartItems(res.data));
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Sepet alınamadı:", error);
      setCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  }, [isLoggedIn, loadingAuth, transformApiResponseToCartItems]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Sepete ürün ekleme veya miktarını artırma
  const addToCart = async (payload: AddToCartPayload) => {
    try {
      setLoadingCart(true);
      const res = await axiosInstance.post("/cart", payload);
      const updatedCartItemsFromApi = transformApiResponseToCartItems(
        res.data as ApiCartResponse
      );

      setCartItems((prevCartItems) => {
        const existingItemIndex = prevCartItems.findIndex(
          (item) => item.productId === payload.productId
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...prevCartItems];
          const updatedQuantity =
            updatedCartItemsFromApi.find(
              (item) => item.productId === payload.productId
            )?.quantity ||
            updatedItems[existingItemIndex].quantity + payload.quantity;

          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedQuantity,
          };
          return updatedItems;
        } else {
          return updatedCartItemsFromApi;
        }
      });
    } catch (error) {
      console.error("Ürün sepete eklenemedi:", error);
    } finally {
      setLoadingCart(false);
    }
  };

  // Sepetten ürün silme
  const removeFromCart = async (productId: number) => {
    try {
      setLoadingCart(true);
      const res = await axiosInstance.delete(`/cart/${productId}`);
      setCartItems(
        transformApiResponseToCartItems(res.data as ApiCartResponse)
      );
    } catch (error) {
      console.error("Ürün silinemedi:", error);
    } finally {
      setLoadingCart(false);
    }
  };

  // Sepeti tamamen temizleme
  const clearCart = async () => {
    try {
      setLoadingCart(true);
      await axiosInstance.delete("/cart");
      setCartItems([]);
    } catch (error) {
      console.error("Sepet temizlenemedi:", error);
    } finally {
      setLoadingCart(false);
    }
  };

  // Ürün miktarını doğrudan güncelleme
  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      setLoadingCart(true);
      const res = await axiosInstance.put(`/cart/${productId}`, { quantity });
      const updatedCartItemsFromApi = transformApiResponseToCartItems(
        res.data as ApiCartResponse
      );

      setCartItems((prevCartItems) => {
        const updatedItemIndex = prevCartItems.findIndex(
          (item) => item.productId === productId
        );

        if (updatedItemIndex === -1) {
          return updatedCartItemsFromApi;
        }

        const updatedItem = {
          ...prevCartItems[updatedItemIndex],
          quantity:
            updatedCartItemsFromApi.find((item) => item.productId === productId)
              ?.quantity || quantity,
        };

        const newCartItems = [...prevCartItems];
        newCartItems[updatedItemIndex] = updatedItem;
        return newCartItems;
      });
    } catch (error) {
      console.error("Adet güncellenemedi:", error);
    } finally {
      setLoadingCart(false);
    }
  };

  // Miktarı azaltma (updateQuantity veya removeFromCart'ı çağırır)
  const decreaseQuantity = async (productId: number) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;

    if (item.quantity === 1) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, item.quantity - 1);
    }
  };

  const getTotalCount = useCallback(() => {
    return Array.isArray(cartItems)
      ? cartItems.reduce((total, item) => total + item.quantity, 0)
      : 0;
  }, [cartItems]);

  const getTotalPrice = useCallback(() => {
    return Array.isArray(cartItems)
      ? cartItems.reduce((total, item) => total + item.quantity * item.price, 0)
      : 0;
  }, [cartItems]);

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
