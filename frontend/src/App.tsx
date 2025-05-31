import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { useAuth } from "./contexts/AuthContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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

// Layout ve Sayfa Importları
import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./layouts/MainLayout";
import NotFoundPage from "./pages/NotFoundPage";
import PanelDashboardPage from "./pages/PanelDashboardPage";
import UserManagementPage from "./pages/UserManagementPage";
import ProductManagementPage from "./pages/ProductManagementPage";

function App() {
  const { loading, isLoggedIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingScreen message="Sayfa yükleniyor, lütfen bekleyiniz..." />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Giriş ve Kayıt Sayfaları */}
        <Route element={<MainLayout />}>
          <Route
            path="/login"
            element={!isLoggedIn ? <LoginForm /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={
              !isLoggedIn ? <RegisterForm /> : <Navigate to="/" replace />
            }
          />
        </Route>

        {/* Ana Kullanıcı Rotaları (MainLayout ile) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          {/* Protected Routes (Kullanıcılar için) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route
              path="/categories"
              element={<div className="">Kategoriler Sayfası</div>}
            />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Route>
        </Route>

        {/* Admin/Seller Protected Panel Rotaları (AdminLayout ile) */}
        <Route element={<ProtectedRoute requiredRoles={["admin", "seller"]} />}>
          <Route path="/panel" element={<AdminLayout />}>
            <Route index element={<PanelDashboardPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="products" element={<ProductManagementPage />} />
          </Route>
        </Route>

        {/* 404 Sayfası (Kendi Layout'u ile) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
