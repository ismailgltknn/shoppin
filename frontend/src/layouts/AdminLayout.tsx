import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  PackageIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";

interface AdminLayoutProps {}

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 my-1 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "bg-indigo-700 text-white shadow-md"
        : "text-indigo-200 hover:bg-indigo-600 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobil Sidebar Açma Butonu */}
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

      {/* Sidebar */}
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
          <NavLink to="/panel/users" className={sidebarNavLinkClasses}>
            <UsersIcon className="w-5 h-5 mr-3" />
            Kullanıcı Yönetimi
          </NavLink>
          <NavLink to="/panel/products" className={sidebarNavLinkClasses}>
            <PackageIcon className="w-5 h-5 mr-3" />
            Ürün Yönetimi
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Alanı */}
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
