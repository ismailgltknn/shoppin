import { NavLink, Link, useLocation } from "react-router-dom";
import {
  ShoppingBasketIcon,
  PackageSearchIcon,
  ListIcon,
  UserIcon,
  UserPlusIcon,
  LogInIcon,
  ShoppingCartIcon,
  ChevronDown,
  UserCogIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import Spinner from "../components/Spinner";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const { getTotalCount, loadingCart } = useCart();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 py-6 text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-100 text-indigo-600"
        : "text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
    }`;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getRoleBadge = () => {
    if (!user || !user.role) return null;

    let text = "";
    let bgColor = "bg-gray-700";
    let textColor = "text-white";

    switch (user.role) {
      case "admin":
        text = "Yönetici";
        bgColor = "bg-orange-500";
        break;
      case "seller":
        text = "Satıcı";
        bgColor = "bg-orange-500";
        break;
      default:
        return null;
    }

    return (
      <span
        className={`absolute -top-3 right-0 inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold ${bgColor} ${textColor}`}
      >
        {text}
      </span>
    );
  };

  const isAdminOrSeller =
    isLoggedIn && (user?.role === "admin" || user?.role === "seller");

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
          {/* Sepet Linki */}
          {isLoggedIn && user && (
            <Link to="/cart">
              <div className="relative hidden md:flex items-center text-sm text-gray-700 hover:text-indigo-500 font-medium px-3 py-2 rounded-md cursor-pointer hover:scale-105 space-x-1">
                {loadingCart ? (
                  <Spinner
                    size="sm"
                    color="text-indigo-600"
                    className="w-4 h-4"
                  />
                ) : getTotalCount() > 0 ? (
                  <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-indigo-600 text-white text-[10px] font-semibold shadow-md ring-2 ring-indigo-300 ring-offset-1">
                    {getTotalCount()}
                  </span>
                ) : null}
                <ShoppingCartIcon className="w-5 h-5 text-indigo-500" />
                <span>Sepetim</span>
              </div>
            </Link>
          )}

          {isLoggedIn && user ? (
            <>
              {/* Panel Linki */}
              {isAdminOrSeller && (
                <NavLink
                  to="/panel"
                  className="flex items-center text-sm font-medium transition-colors text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <UserCogIcon className="w-4 h-4 mr-2 text-indigo-500" />
                  Panel
                </NavLink>
              )}

              {/* Kullanıcı Adı ve Dropdown */}
              <div className="relative" ref={dropdownRef}>
                {getRoleBadge()}
                <button
                  onClick={toggleDropdown}
                  className="flex items-center text-sm text-gray-700 font-medium px-3 py-2 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <UserIcon className="w-4 h-4 mr-2 text-indigo-500" />
                  {user.name}
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-gray-200 ring-opacity-75">
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      Profilim
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="cursor-pointer flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      <LogInIcon className="w-4 h-4 transform rotate-180" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
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
