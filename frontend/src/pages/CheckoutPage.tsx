import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "../components/Spinner";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, loadingCart, fetchCart } = useCart();
  const { user, loading: loadingUser } = useAuth();

  const [shippingAddress, setShippingAddress] = useState<string>("");
  const [billingAddress, setBillingAddress] = useState<string>("");
  const [useProfileShipping, setUseProfileShipping] = useState<boolean>(true);
  const [useProfileBilling, setUseProfileBilling] = useState<boolean>(true);
  const [isBillingSameAsShipping, setIsBillingSameAsShipping] =
    useState<boolean>(false); // Yeni state
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

  // Kullanıcı yüklendiğinde varsayılan adresleri ayarla
  useEffect(() => {
    if (!loadingUser && user) {
      // Gönderim adresi ayarları
      if (user.shipping_address) {
        setShippingAddress(user.shipping_address);
        setUseProfileShipping(true);
      } else {
        setUseProfileShipping(false);
        setShippingAddress(""); // Profilde yoksa boş başlat
      }

      // Fatura adresi ayarları
      if (user.billing_address) {
        setBillingAddress(user.billing_address);
        setUseProfileBilling(true);
        setIsBillingSameAsShipping(false); // Profil adresi varsa "aynı" seçeneği pasif olmalı
      } else {
        setUseProfileBilling(false);
        setBillingAddress(""); // Profilde yoksa boş başlat
        setIsBillingSameAsShipping(false); // Başlangıçta aynı değil
      }
    } else if (!loadingUser && !user) {
      // Kullanıcı yoksa veya login değilse adres alanlarını boş bırak
      setShippingAddress("");
      setBillingAddress("");
      setUseProfileShipping(false);
      setUseProfileBilling(false);
      setIsBillingSameAsShipping(false);
    }
  }, [user, loadingUser]);

  // Gönderim adresi değiştiğinde veya "aynı" checkbox'ı işaretlendiğinde fatura adresini güncelle
  useEffect(() => {
    if (isBillingSameAsShipping && !useProfileBilling) {
      // Sadece profil fatura adresi kullanılmıyorsa ve "aynı" seçiliyse
      setBillingAddress(shippingAddress);
    }
  }, [isBillingSameAsShipping, shippingAddress, useProfileBilling]);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Gönderilecek son adresleri belirle
    const finalShippingAddress =
      useProfileShipping && user?.shipping_address
        ? user.shipping_address
        : shippingAddress;

    let finalBillingAddress;
    if (useProfileBilling && user?.billing_address) {
      finalBillingAddress = user.billing_address;
    } else if (isBillingSameAsShipping) {
      finalBillingAddress = finalShippingAddress; // Gönderim adresi ile aynı olacak
    } else {
      finalBillingAddress = billingAddress;
    }

    if (!finalShippingAddress.trim()) {
      setError("Gönderim adresi boş bırakılamaz.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("/orders", {
        shipping_address: finalShippingAddress,
        billing_address: finalBillingAddress,
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

  if (loadingCart || loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="md" color="text-indigo-600" />
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
              {/* Gönderim Adresi */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Gönderim Adresi:
                </label>
                {/* Sadece kullanıcının profilinde en az bir adres varsa checkboxları göster */}
                {user && (user.shipping_address || user.billing_address) && (
                  <div className="mb-3">
                    {user.shipping_address && (
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-indigo-600"
                          checked={useProfileShipping}
                          onChange={() => {
                            setUseProfileShipping(!useProfileShipping);
                            // Eğer profil adresini kullanmaktan vazgeçilirse, alanı boşalt
                            if (useProfileShipping) {
                              setShippingAddress("");
                            } else if (user?.shipping_address) {
                              // Profil adresini kullanmaya geçilirse, profil adresini yükle
                              setShippingAddress(user.shipping_address);
                            }
                          }}
                          disabled={!user.shipping_address} // Profil adresi yoksa
                        />
                        <span className="ml-2 text-gray-700">
                          Profildeki gönderim adresimi kullan
                        </span>
                      </label>
                    )}
                  </div>
                )}
                <textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  rows={4}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    useProfileShipping && user?.shipping_address
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                  placeholder="Açık gönderim adresinizi girin..."
                  value={
                    useProfileShipping && user?.shipping_address
                      ? user.shipping_address
                      : shippingAddress
                  }
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                  disabled={useProfileShipping && !!user?.shipping_address}
                ></textarea>
                {useProfileShipping && !user?.shipping_address && (
                  <p className="text-sm text-red-500 mt-1">
                    Profilinizde kayıtlı gönderim adresi bulunamadı. Lütfen
                    adres girin.
                  </p>
                )}
              </div>

              {/* Fatura Adresi */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Fatura Adresi:
                </label>
                {user && (user.shipping_address || user.billing_address) && (
                  <div className="mb-3 flex flex-wrap gap-x-4">
                    {user.billing_address && (
                      <label className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-indigo-600"
                          checked={useProfileBilling}
                          onChange={() => {
                            setUseProfileBilling(!useProfileBilling);
                            if (!useProfileBilling) {
                              setIsBillingSameAsShipping(false);
                              setBillingAddress("");
                            } else if (user?.billing_address) {
                              setBillingAddress(user.billing_address);
                            }
                          }}
                          disabled={!user.billing_address}
                        />
                        <span className="ml-2 text-gray-700">
                          Profildeki fatura adresimi kullan
                        </span>
                      </label>
                    )}
                    {/* "Gönderim adresi ile aynı" checkbox'ı sadece profil fatura adresi kullanılmıyorsa aktif olacak */}
                    {shippingAddress.trim() !== "" && (
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-indigo-600"
                          checked={isBillingSameAsShipping}
                          onChange={() => {
                            setIsBillingSameAsShipping(
                              !isBillingSameAsShipping
                            );
                            if (!isBillingSameAsShipping) {
                              setBillingAddress(shippingAddress);
                            }
                            setUseProfileBilling(false);
                          }}
                        />
                        <span className="ml-2 text-gray-700">
                          Gönderim adresi ile aynı
                        </span>
                      </label>
                    )}
                  </div>
                )}
                <textarea
                  id="billingAddress"
                  name="billingAddress"
                  rows={4}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    (useProfileBilling && user?.billing_address) ||
                    isBillingSameAsShipping
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                  placeholder="Fatura adresinizi girin..."
                  value={
                    useProfileBilling && user?.billing_address
                      ? user.billing_address
                      : billingAddress
                  }
                  onChange={(e) => {
                    setBillingAddress(e.target.value);
                    // Kullanıcı manuel değişiklik yaparsa "aynı" checkbox'ını kaldır
                    if (isBillingSameAsShipping) {
                      setIsBillingSameAsShipping(false);
                    }
                  }}
                  disabled={
                    (useProfileBilling && !!user?.billing_address) ||
                    isBillingSameAsShipping
                  }
                ></textarea>
                {useProfileBilling && !user?.billing_address && (
                  <p className="text-sm text-red-500 mt-1">
                    Profilinizde kayıtlı fatura adresi bulunamadı. Lütfen adres
                    girin.
                  </p>
                )}
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
