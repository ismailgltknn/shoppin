import { lazy, Suspense } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { useAuth } from "./contexts/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProfilePage from "./pages/ProfilePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import LoadingScreen from "./components/LoadingScreen";

import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./layouts/MainLayout";
import NotFoundPage from "./pages/NotFoundPage";
import PanelDashboardPage from "./pages/PanelDashboardPage";
import UserManagementPage from "./pages/UserManagementPage";

import { CartProvider } from "./contexts/CartContext";
import { ProductProvider } from "./contexts/ProductContext";

const LazyProductManagementPage = lazy(
  () => import("./pages/ProductManagementPage")
);

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="bottom-right" reverseOrder={false} />
      <Routes>
        {/* Public Rotalar */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Ana Layout'u Kullanan Rotalar */}
        <Route
          element={
            <CartProvider>
              <MainLayout />
            </CartProvider>
          }
        >
          <Route path="/" element={<HomePage />} />
          {/* Sadece giriş yapmış kullanıcıların erişebileceği rotalar */}
          <Route element={<ProtectedRoute />}>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route
              path="/categories"
              element={<div className="">Kategoriler Sayfası</div>}
            />
            <Route path="/cart" element={<CartPage />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Route>
        </Route>

        {/* Admin/Seller Protected Panel Rotaları */}
        {/*
          Genel panel erişimi için, yetkisizse anasayfaya yönlendir (redirectPath="/").
          Örn: Customer buraya gelirse anasayfaya gider.
        */}
        <Route
          element={
            <ProtectedRoute
              requiredRoles={["admin", "seller"]}
              redirectPath="/"
            />
          }
        >
          <Route path="/panel" element={<AdminLayout />}>
            <Route index element={<PanelDashboardPage />} />

            {/*
              Admin kullanıcı yönetimi sayfasına sadece 'admin' rolü olanlar erişebilir.
              Eğer admin değilse ama panel rolü varsa (örn: seller), /panel'e yönlendir (redirectPath="/panel").
            */}
            <Route
              element={
                <ProtectedRoute
                  requiredRoles={["admin"]}
                  redirectPath="/panel"
                />
              }
            >
              <Route path="users" element={<UserManagementPage />} />
            </Route>

            {/* ProductManagementPage zaten admin/seller tarafından erişilebilir */}
            <Route
              path="products"
              element={
                <ProductProvider>
                  <Suspense
                    fallback={<LoadingScreen message="Ürünler yükleniyor..." />}
                  >
                    <LazyProductManagementPage />
                  </Suspense>
                </ProductProvider>
              }
            />
          </Route>
        </Route>

        {/* 404 Sayfası (Kendi Layout'u ile) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
