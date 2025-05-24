import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, loadingCart, fetchCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState<string>("");
  const [billingAddress, setBillingAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!loadingCart && cartItems.length === 0) {
      if (window.location.pathname === "/checkout") {
        alert("Sepetiniz boş. Lütfen önce ürün ekleyin.");
        navigate("/cart");
      }
    }
  }, [cartItems, loadingCart, navigate]);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!shippingAddress.trim()) {
      setError("Gönderim adresi boş bırakılamaz.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("/orders", {
        shipping_address: shippingAddress,
        billing_address:
          billingAddress.trim() === "" ? shippingAddress : billingAddress,
      });

      console.log("Sipariş yanıtı:", response.data);
      alert(response.data.message);

      await fetchCart();

      navigate(`/orders/${response.data.orderId}`);
    } catch (err: any) {
      console.error(
        "Sipariş oluşturulurken hata:",
        err.response ? err.response.data : err
      );
      setError(
        err.response?.data?.message || "Sipariş oluşturulurken bir hata oluştu."
      );

      if (err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        let errorMessage = "";
        for (const key in backendErrors) {
          if (Array.isArray(backendErrors[key])) {
            errorMessage += backendErrors[key].join("\n") + "\n";
          } else {
            errorMessage += backendErrors[key] + "\n";
          }
        }
        setError(errorMessage.trim());
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingCart) {
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
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-12 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Sipariş Onayı</h1>
        <p className="text-gray-600 text-lg">
          Sepetiniz boş. Sipariş oluşturmak için{" "}
          <Link to="/products" className="text-indigo-600 hover:underline">
            ürün ekleyin
          </Link>
          .
        </p>
        <button
          onClick={() => navigate("/cart")}
          className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Sepete Git
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Sipariş Onayı
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Hata!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sipariş Özeti */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6 h-fit sticky top-24 self-start">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Sipariş Özeti
            </h2>
            <div className="space-y-2 mb-4 border-b pb-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>
                    {item.name} ({item.quantity} adet)
                  </span>
                  <span>{(item.price * item.quantity).toFixed(2)} ₺</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-800">
              <span>Toplam Tutar:</span>
              <span>{totalPrice.toFixed(2)} ₺</span>
            </div>
          </div>

          {/* Adres Bilgileri ve Onay Formu */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Adres Bilgileri
            </h2>
            <form onSubmit={handleSubmitOrder}>
              <div className="mb-6">
                <label
                  htmlFor="shippingAddress"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Gönderim Adresi:
                </label>
                <textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  rows={4}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Açık adresinizi girin..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="billingAddress"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Fatura Adresi (Boş bırakırsanız gönderim adresi kullanılır):
                </label>
                <textarea
                  id="billingAddress"
                  name="billingAddress"
                  rows={4}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Fatura adresinizi girin..."
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
                disabled={loading}
              >
                {loading ? "Sipariş Oluşturuluyor..." : "Siparişi Tamamla"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
