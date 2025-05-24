import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Navbar from "./components/Navbar";
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
import Breadcrumbs from "./components/Breadcrumbs";

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
      <div className="flex flex-col">
        <Navbar />
        <Breadcrumbs />
        <main className="min-h-[90vh]">
          <Routes>
            <Route
              path="/login"
              element={
                !isLoggedIn ? <LoginForm /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/register"
              element={
                !isLoggedIn ? <RegisterForm /> : <Navigate to="/" replace />
              }
            />
            <Route path="/" element={<HomePage />} />
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route
                path="/categories"
                element={<div className="">Kategoriler Sayfası</div>}
              />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />{" "}
              <Route path="/orders" element={<OrdersPage />} />{" "}
              <Route path="/orders/:id" element={<OrderDetailPage />} />{" "}
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
