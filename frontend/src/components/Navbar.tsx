import { NavLink, Link, useLocation } from "react-router-dom";
import {
  ShoppingBasketIcon,
  PackageSearchIcon,
  ListIcon,
  UserIcon,
  UserPlusIcon,
  LogInIcon,
  LogOutIcon,
  ShoppingCartIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import Spinner from "../components/Spinner";

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const { getTotalCount, loadingCart } = useCart();
  const location = useLocation();

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 py-6 text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-100 text-indigo-600"
        : "text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
    }`;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center text-2xl font-bold text-indigo-600 tracking-tight"
        >
          <ShoppingBasketIcon className="w-6 h-6 mr-2" />
          Shoppin
        </Link>

        {isLoggedIn && user ? (
          <>
            <nav className="hidden md:flex items-center">
              <NavLink to="/products" className={linkClasses}>
                <PackageSearchIcon className="w-4 h-4 mr-2" />
                Ürünler
              </NavLink>
              <NavLink to="/orders" className={linkClasses}>
                <ListIcon className="w-4 h-4 mr-2" />
                Siparişlerim
              </NavLink>
            </nav>
          </>
        ) : (
          <div className="py-8"></div>
        )}
        <div className="flex items-center space-x-2">
          {isLoggedIn && user ? (
            <>
              <Link to="/cart">
                <div className="relative hidden md:flex items-center text-sm text-gray-700 hover:text-indigo-500 font-medium px-3 py-2 rounded-md cursor-pointer hover:scale-105 space-x-1">
                  {loadingCart ? (
                    <Spinner
                      size="sm"
                      color="text-indigo-600"
                      className="w-4 h-4"
                    />
                  ) : getTotalCount() > 0 ? (
                    <span className="text-xs font-medium text-indigo-700 bg-indigo-50 transition-colors duration-200 border border-indigo-300 rounded-xl px-2 py-[2px] shadow-lg">
                      {getTotalCount()}
                    </span>
                  ) : null}

                  <ShoppingCartIcon className="w-5 h-5 text-indigo-500" />
                  <span>Sepetim</span>
                </div>
              </Link>

              <div className="hidden md:flex items-center text-sm text-gray-700 font-medium px-3 py-2 rounded-md bg-gray-50">
                <UserIcon className="w-4 h-4 mr-2 text-indigo-500" />
                {user.name}
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-sm cursor-pointer hover:bg-indigo-50 text-sm text-red-500 px-4 py-2 transition-all hover:scale-105"
              >
                <LogOutIcon className="w-4 h-4" />
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              {location.pathname === "/login" ? (
                <Link
                  to="/register"
                  className="flex items-center rounded-sm cursor-pointer hover:bg-indigo-50 text-sm text-indigo-500 px-4 py-2 transition-all hover:scale-105"
                >
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Kayıt Ol
                </Link>
              ) : location.pathname === "/register" ? (
                <Link
                  to="/login"
                  className="flex items-center rounded-sm cursor-pointer hover:bg-indigo-50 text-sm text-indigo-500 px-4 py-2 transition-all hover:scale-105"
                >
                  <LogInIcon className="w-4 h-4 mr-2" />
                  Giriş Yap
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center rounded-sm cursor-pointer hover:bg-indigo-50 text-sm text-indigo-500 px-4 py-2 transition-all hover:scale-105"
                >
                  <LogInIcon className="w-4 h-4 mr-2" />
                  Giriş Yap
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
