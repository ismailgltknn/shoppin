import { useCart } from "../contexts/CartContext";
import { TrashIcon, PlusIcon, MinusIcon } from "lucide-react";
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
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Sepetim
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            Sepetiniz boş.{" "}
            <Link to="/products" className="text-indigo-600 hover:underline">
              Ürünlere göz atın.
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  onClick={() => navigate(`/products/${item.productId}`)}
                  className="cursor-pointer bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div>
                      <h2 className="text-lg font-semibold">{item.name}</h2>
                      <p className="text-gray-500">{item.price} ₺</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border border-gray-300 p-1 rounded-sm ml-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        decreaseQuantity(item.productId);
                      }}
                      className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-sm bg-gray-100 hover:bg-gray-200 transition shadow-sm"
                      title="Adet azalt"
                    >
                      <MinusIcon className="w-5 h-5 text-gray-600" />
                    </button>

                    <span className="font-semibold text-gray-800 min-w-[24px] text-center">
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
                      className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-sm bg-gray-100 hover:bg-gray-200 transition shadow-sm"
                      title="Adet artır"
                    >
                      <PlusIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(item.productId);
                    }}
                    className="cursor-pointer ml-4 w-9 h-9 flex items-center justify-center rounded-sm hover:scale-110 transition"
                    title="Ürünü sil"
                  >
                    <TrashIcon className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-24 self-start">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Sipariş Özeti
              </h2>

              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Toplam Tutar:</span>
                <span className="text-indigo-600 font-bold">
                  {totalPrice.toFixed(2)} ₺
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full mt-10 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition cursor-pointer"
              >
                Sepeti Onayla
              </button>

              <button
                onClick={clearCart}
                className="w-full mt-6 text-sm text-red-600 hover:underline cursor-pointer"
              >
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
