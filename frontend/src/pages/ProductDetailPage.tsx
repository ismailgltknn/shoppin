import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useCart } from "../contexts/CartContext";
import { MinusIcon, PlusIcon, PackagePlusIcon } from "lucide-react";

interface Product {
  id: number;
  name: string;
  ct_name: string;
  price: number;
  image: string;
  description?: string;
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const { addToCart, decreaseQuantity, cartItems, loadingCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        const res = await axiosInstance.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Ürün alınamadı:", err);
        setProduct(null);
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [id]);

  const cartItem = cartItems.find((item) => item.productId === product?.id);

  if (loadingCart || loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <svg
          className="animate-spin h-10 w-10 text-indigo-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
    );
  } else if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Ürün bulunamadı.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="w-full h-[400px] bg-gray-100 rounded-xl overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-sm text-gray-500 mb-4">{product.ct_name}</p>
            <p className="text-indigo-600 font-bold text-2xl mb-6">
              {product.price} ₺
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              {product.description ||
                "Bu ürün hakkında detaylı bilgi henüz eklenmemiştir."}
            </p>
          </div>

          {cartItem ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => decreaseQuantity(cartItem.productId)}
                className="cursor-pointer px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                <MinusIcon className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-lg font-semibold">{cartItem.quantity}</span>
              <button
                onClick={() =>
                  addToCart({
                    productId: product.id,
                    quantity: 1,
                  })
                }
                className="cursor-pointer px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                <PlusIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <button
              onClick={() =>
                addToCart({
                  productId: product.id,
                  quantity: 1,
                })
              }
              className="cursor-pointer mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition"
            >
              <PackagePlusIcon className="w-5 h-5" />
              Sepete Ekle
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
