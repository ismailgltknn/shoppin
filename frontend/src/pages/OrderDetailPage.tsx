import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import { useParams, Link } from "react-router-dom";

interface OrderItemApi {
  id: number;
  product_id: number;
  order_id: number;
  quantity: number;
  unit_price: string;
  product: {
    id: number;
    name: string;
    image: string;
    price: string;
  };
  created_at: string;
  updated_at: string;
}

interface OrderApi {
  id: number;
  user_id: number;
  order_date: string;
  total_price: string;
  order_status: string;
  shipping_address: string;
  billing_address: string;
  order_items: OrderItemApi[];
  created_at: string;
  updated_at: string;
}

interface OrderItemProcessed {
  id: number;
  productId: number;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
}

interface OrderProcessed {
  id: number;
  userId: number;
  orderDate: string;
  totalPrice: number;
  orderStatus: string;
  shippingAddress: string;
  billingAddress: string;
  orderItems: OrderItemProcessed[];
  createdAt: string;
  updatedAt: string;
}

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderProcessed | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get<OrderApi>(`/orders/${id}`);
        const apiOrder = response.data;

        const processedOrderItems: OrderItemProcessed[] =
          apiOrder.order_items.map((item) => ({
            id: item.id,
            productId: item.product_id,
            name: item.product?.name || "Ürün Bilgisi Yok",
            image: item.product?.image || "",
            quantity: item.quantity,
            unitPrice: parseFloat(item.unit_price),
          }));

        const processedOrder: OrderProcessed = {
          id: apiOrder.id,
          userId: apiOrder.user_id,
          orderDate: apiOrder.order_date,
          totalPrice: parseFloat(apiOrder.total_price),
          orderStatus: apiOrder.order_status,
          shippingAddress: apiOrder.shipping_address,
          billingAddress: apiOrder.billing_address,
          orderItems: processedOrderItems,
          createdAt: apiOrder.created_at,
          updatedAt: apiOrder.updated_at,
        };

        setOrder(processedOrder);
      } catch (err: any) {
        console.error(
          "Sipariş detayı çekilirken hata:",
          err.response ? err.response.data : err
        );
        if (err.response && err.response.status === 404) {
          setError(
            "Sipariş bulunamadı veya bu siparişi görüntüleme yetkiniz yok."
          );
        } else {
          setError(
            err.response?.data?.message ||
              "Sipariş detayları yüklenirken bir sorun oluştu."
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading)
    return (
      <div className="p-4 text-center">Sipariş detayları yükleniyor...</div>
    );
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!order)
    return <div className="p-4 text-center">Sipariş detayı bulunamadı.</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Sipariş Detayı: <span className="text-indigo-600">#{order.id}</span>
        </h1>

        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Sipariş Bilgileri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p>
              <strong>Durum:</strong>{" "}
              <span
                className={`font-medium ${
                  order.orderStatus === "processing"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {order.orderStatus}
              </span>
            </p>
            <p>
              <strong>Tarih:</strong>{" "}
              {new Date(order.orderDate).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p>
              <strong>Toplam Tutar:</strong>{" "}
              <span className="font-bold text-lg">
                {order.totalPrice.toFixed(2)} ₺
              </span>
            </p>
            <p>
              <strong>Gönderim Adresi:</strong> {order.shippingAddress}
            </p>
            <p>
              <strong>Fatura Adresi:</strong>{" "}
              {order.billingAddress || "Belirtilmedi"}
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Ürünler</h2>
          {order.orderItems && order.orderItems.length > 0 ? (
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name || "Ürün Resmi"}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.name || "Ürün Bilgisi Yok"}
                      </h3>
                      <p className="text-gray-600">
                        {item.quantity} Adet x {item.unitPrice.toFixed(2)} ₺
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-800 text-lg">
                    {(item.quantity * item.unitPrice).toFixed(2)} ₺
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Bu siparişte ürün bulunmamaktadır.</p>
          )}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/orders"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            Tüm Siparişlerime Geri Dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
