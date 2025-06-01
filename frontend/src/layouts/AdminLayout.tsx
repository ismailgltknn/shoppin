import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  PackageIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface AdminLayoutProps {}

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const hasRole = (roleToCheck: string): boolean => {
    return user?.role === roleToCheck;
  };

  const hasAnyRole = (rolesToCheck: string[]): boolean => {
    return user?.role ? rolesToCheck.includes(user.role) : false;
  };

  const sidebarNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 my-1 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "bg-indigo-700 text-white shadow-md"
        : "text-indigo-200 hover:bg-indigo-600 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <button
        className="cursor-pointer md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-indigo-600 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <XIcon className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
        )}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-indigo-900 text-white transform md:translate-x-0 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-center h-16 bg-indigo-800 shadow-md">
          <NavLink
            to="/"
            className="text-2xl font-bold text-white tracking-tight"
          >
            Shoppin
          </NavLink>
        </div>
        <nav className="flex flex-col p-4">
          <NavLink to="/panel" end className={sidebarNavLinkClasses}>
            <HomeIcon className="w-5 h-5 mr-3" />
            Anasayfa
          </NavLink>

          {hasRole("admin") && (
            <NavLink to="/panel/users" className={sidebarNavLinkClasses}>
              <UsersIcon className="w-5 h-5 mr-3" />
              Kullanıcı Yönetimi
            </NavLink>
          )}

          {hasAnyRole(["admin", "seller"]) && (
            <NavLink to="/panel/products" className={sidebarNavLinkClasses}>
              <PackageIcon className="w-5 h-5 mr-3" />
              Ürün Yönetimi
            </NavLink>
          )}
        </nav>
      </aside>

      <div className="flex-1 md:ml-64 p-4 md:p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
