import { useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { PackagePlusIcon, MinusIcon, PlusIcon } from "lucide-react";
import Spinner from "../components/Spinner";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  ct_name: string;
  price: number;
  image: string;
}

interface Category {
  id: number;
  name: string;
}

const ProductsPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const { loadingCart, addToCart, decreaseQuantity, cartItems } = useCart();

  const observerRef = useRef<HTMLDivElement | null>(null);
  const productListRef = useRef<HTMLDivElement | null>(null);

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setShouldScroll(true);
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Kategoriler alınamadı:", error);
    }
  };

  const fetchProducts = async (page: number, categoryId = selectedCategory) => {
    if (loading || page > lastPage) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get("/products", {
        params: {
          page,
          category_id: categoryId,
        },
      });

      if (page === 1) {
        setProducts(response.data.data);
      } else {
        setProducts((prev) => [...prev, ...response.data.data]);
      }

      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setProducts([]);
    setCurrentPage(1);
    setLastPage(1);
    fetchProducts(1);
  }, [selectedCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && currentPage < lastPage) {
          fetchProducts(currentPage + 1);
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [currentPage, lastPage, selectedCategory, loadingCart]);

  useEffect(() => {
    if (shouldScroll && productListRef.current) {
      const offsetTop = productListRef.current.offsetTop;
      const stickyOffset = document.querySelector("aside")?.clientHeight || 100;
      window.scrollTo({ top: offsetTop - stickyOffset, behavior: "smooth" });
      setShouldScroll(false);
    }
  }, [products, shouldScroll]);

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loadingCart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="md" color="text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        {loadingCart || categories.length === 0 ? (
          <div className="w-[240px]" />
        ) : (
          <aside className="sticky top-24 h-max bg-white border border-gray-200 rounded-sm p-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-3 text-gray-600">
              Kategoriler
            </h2>
            <hr className="text-gray-300 mb-4" />

            <ul className="flex flex-col gap-2">
              <li>
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`cursor-pointer w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedCategory === null
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Tümü
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => handleCategorySelect(category.id)}
                    className={`cursor-pointer w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      selectedCategory === category.id
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
        <section className="flex flex-col">
          <div ref={productListRef} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const cartItem = Array.isArray(cartItems)
                ? cartItems.find((item) => item.productId === product.id)
                : undefined;

              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
                >
                  <div className="w-full h-56 bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-5 flex flex-col gap-2">
                    <h2
                      className="text-lg font-semibold text-gray-900 mb-1"
                      title={product.name}
                    >
                      {product.name.length > 15
                        ? product.name.slice(0, 15) + " ..."
                        : product.name}
                    </h2>

                    <h2 className="text-sm font-semibold text-gray-500 mb-1">
                      {product.ct_name}
                    </h2>
                    <p className="text-indigo-600 font-bold text-lg">
                      {product.price} ₺
                    </p>
                    {cartItem ? (
                      <div className="mt-4 flex items-center justify-center gap-2 border border-gray-300 p-1 rounded-sm mx-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            decreaseQuantity(cartItem.productId);
                          }}
                          className="px-3 py-1 bg-gray-100 rounded-sm hover:bg-gray-300 text-lg font-bold cursor-pointer"
                        >
                          <MinusIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        <span className="px-2 text-sm font-semibold text-gray-700">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({
                              productId: product.id,
                              quantity: 1,
                            });
                          }}
                          className="px-3 py-1 bg-gray-100 rounded-sm hover:bg-gray-300 text-lg font-bold cursor-pointer"
                        >
                          <PlusIcon className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            productId: product.id,
                            quantity: 1,
                          });
                        }}
                        className="mt-4 cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-sm hover:bg-indigo-700 transition duration-300"
                      >
                        <PackagePlusIcon className="w-5 h-5" />
                        Sepete Ekle
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            ref={observerRef}
            className="h-20 flex justify-center items-center mt-6"
          >
            {loading && <Spinner size="sm" color="text-indigo-600" />}
          </div>
        </section>
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default ProductsPage;
