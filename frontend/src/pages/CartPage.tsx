import { useCart } from "../contexts/CartContext";
import { Trash2Icon, PlusIcon, MinusIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

const CartPage = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    loadingCart,
    removeFromCart,
    clearCart,
    addToCart,
    decreaseQuantity,
  } = useCart();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (loadingCart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="md" color="text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-12">
          Sepetim
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-gray-600 text-xl mb-4">
              Sepetiniz şu an boş görünüyor.
            </p>
            <Link
              to="/products"
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors duration-300"
            >
              Ürünlere Göz Atın
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col sm:flex-row items-center sm:justify-between gap-6"
                >
                  <div className="flex items-center gap-4 flex-grow">
                    <img
                      src={item.image}
                      alt={item.name}
                      onClick={() => navigate(`/products/${item.productId}`)}
                      className="cursor-pointer w-24 h-24 object-cover rounded-lg border border-gray-100 shadow-sm"
                    />
                    <div className="flex-grow">
                      <h2
                        className="cursor-pointer text-xl font-semibold text-gray-800 line-clamp-2"
                        onClick={() => navigate(`/products/${item.productId}`)}
                      >
                        {item.name}
                      </h2>
                      <p className="text-gray-500 text-base mt-1">
                        Birim Fiyat:{" "}
                        <span className="font-bold text-indigo-600">
                          {item.price.toFixed(2)} ₺
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    {/* Miktar kontrolü */}
                    <div className="flex items-center justify-center gap-1 bg-gray-50 border border-gray-200 p-0.5 rounded-lg w-[150px] shadow-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          decreaseQuantity(item.productId);
                        }}
                        className="cursor-pointer p-2 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-700 font-bold transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-indigo-300"
                        title="Adet azalt"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>

                      <span className="flex-1 text-sm font-semibold text-gray-800 tabular-nums text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            productId: item.productId,
                            quantity: 1,
                          });
                        }}
                        className="cursor-pointer p-2 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-700 font-bold transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-indigo-300"
                        title="Adet artır"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Ürünü Sil butonu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.productId);
                      }}
                      className="cursor-pointer p-2 rounded-md hover:bg-red-50 transition-colors duration-200 flex items-center justify-center"
                      title="Ürünü sepetten sil"
                    >
                      <Trash2Icon className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sipariş Özeti */}
            <div className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-24 self-start border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4 border-gray-200">
                Sipariş Özeti
              </h2>

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 text-lg">Ürün Toplamı:</span>
                <span className="text-gray-800 font-semibold text-lg">
                  {totalPrice.toFixed(2)} ₺
                </span>
              </div>
              <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-100">
                <span className="text-gray-600 text-lg">Kargo Ücreti:</span>
                <span className="text-green-600 font-semibold text-lg">
                  Ücretsiz
                </span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-indigo-800 text-xl font-bold">
                  Genel Toplam:
                </span>
                <span className="text-indigo-800 font-extrabold text-2xl">
                  {totalPrice.toFixed(2)} ₺
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full px-6 py-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
              >
                Siparişi Tamamla
              </button>

              <button
                onClick={clearCart}
                className="w-full mt-10 px-6 py-3 text-sm text-red-600 bg-gray-50 hover:bg-gray-100 font-semibold rounded-lg transition-colors duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2Icon className="w-4 h-4" />
                Sepeti Temizle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
