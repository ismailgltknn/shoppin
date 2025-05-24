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
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr] xl:grid-cols-[240px_1fr] gap-8">
        {loadingCart || categories.length === 0 ? (
          <div className="hidden md:block" />
        ) : (
          <aside className="sticky top-24 h-max bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg p-2 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 ml-1 text-gray-800">
              Kategoriler
            </h2>
            <ul className="flex flex-col gap-2">
              <li>
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`cursor-pointer w-full text-left px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    selectedCategory === null
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                  }`}
                >
                  Tüm Ürünler
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => handleCategorySelect(category.id)}
                    className={`cursor-pointer w-full text-left px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const cartItem = Array.isArray(cartItems)
                ? cartItems.find((item) => item.productId === product.id)
                : undefined;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="w-full h-48 sm:h-56 bg-gray-100 overflow-hidden rounded-t-xl">
                    <img
                      src={product.image}
                      alt={product.name}
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="cursor-pointer w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <h3
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="cursor-pointer text-lg font-semibold text-gray-900 truncate"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-500">
                      {product.ct_name}
                    </p>
                    <p className="text-indigo-700 font-extrabold text-xl mt-1">
                      {product.price} ₺
                    </p>
                    {cartItem ? (
                      <div className="mt-3 flex items-center justify-center gap-1 bg-gray-50 border border-gray-200 p-0.5 rounded-lg mx-auto w-fit min-w-[150px] shadow-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            decreaseQuantity(cartItem.productId);
                          }}
                          className="cursor-pointer p-2 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-700 font-bold transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-indigo-300"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="px-2 text-sm font-semibold text-gray-800 tabular-nums">
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
                          className="cursor-pointer p-2 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-700 font-bold transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-indigo-300"
                        >
                          <PlusIcon className="w-4 h-4" />
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
                        className="mt-3 w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-sm hover:bg-indigo-700 transition-all duration-300 shadow-md"
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
            className="h-20 flex justify-center items-center mt-8"
          >
            {loading && <Spinner size="md" color="text-indigo-600" />}
          </div>
        </section>
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default ProductsPage;
