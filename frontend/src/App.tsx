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
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";

function App() {
  const { loading, isLoggedIn } = useAuth();

  if (loading) {
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

  return (
    <Router>
      <div className="flex flex-col">
        <Navbar />
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
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route
                path="/categories"
                element={<div className="">Kategoriler Sayfası</div>}
              />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />{" "}
              {/* Yeni: Checkout rotası */}
              <Route path="/orders" element={<OrdersPage />} />{" "}
              {/* Yeni: Siparişler listesi rotası */}
              <Route path="/orders/:id" element={<OrderDetailPage />} />{" "}
              {/* Yeni: Tek sipariş detayı rotası */}
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
