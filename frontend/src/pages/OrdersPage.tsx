import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import { Link } from "react-router-dom";

interface OrderItem {
  id: number;
  product_id: number;
  order_id: number;
  quantity: number;
  unit_price: number;
  product: {
    id: number;
    name: string;
  };
}

interface Order {
  id: number;
  user_id: number;
  order_date: string;
  total_price: number;
  order_status: string;
  shipping_address: string;
  billing_address: string;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

interface OrdersResponse {
  data: Order[];
  current_page: number;
  last_page: number;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get<OrdersResponse>(
          `/orders?page=${currentPage}`
        );
        setOrders(response.data.data);
        setCurrentPage(response.data.current_page);
        setLastPage(response.data.last_page);
      } catch (err: any) {
        console.error(
          "Siparişler çekilirken hata:",
          err.response ? err.response.data : err
        );
        setError(
          err.response?.data?.message ||
            "Siparişler yüklenirken bir sorun oluştu."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
    }
  };

  if (loading)
    return <div className="p-4 text-center">Siparişler yükleniyor...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (orders.length === 0)
    return (
      <div className="p-4 text-center">Henüz siparişiniz bulunmamaktadır.</div>
    );

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Siparişlerim
        </h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                Sipariş ID: <span className="text-indigo-600">#{order.id}</span>
              </h2>
              <p className="text-gray-600 mb-1">
                <strong>Durum:</strong>{" "}
                <span
                  className={`font-medium ${
                    order.order_status === "processing"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {order.order_status}
                </span>
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Tarih:</strong>{" "}
                {new Date(order.order_date).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-600 mb-3">
                <strong>Toplam Tutar:</strong>{" "}
                <span className="font-bold">
                  {order.total_price.toFixed(2)} ₺
                </span>
              </p>
              <Link
                to={`/orders/${order.id}`}
                className="inline-block px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors duration-200"
              >
                Detayları Görüntüle
              </Link>
            </div>
          ))}
        </div>

        {lastPage > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Önceki
            </button>
            {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 border rounded-lg ${
                  currentPage === page
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === lastPage}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
