import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";

interface MainLayoutProps {}

const MainLayout: React.FC<MainLayoutProps> = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Breadcrumbs />
      <main className="flex-1 min-h-[90vh]">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
