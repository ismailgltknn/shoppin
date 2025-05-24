import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";

interface BreadcrumbItem {
  name: string;
  path: string;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const params = useParams();

  const routeNameMap: { [key: string]: string } = {
    products: "Ürünler",
    orders: "Siparişlerim",
    cart: "Sepetim",
    profile: "Profil",
    checkout: "Sipariş Onayı",
  };

  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/profile"
  ) {
    return null;
  }

  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbItems: BreadcrumbItem[] = [];

  breadcrumbItems.push({ name: "Ana Sayfa", path: "/" });

  pathnames.forEach((value, index) => {
    const currentPathSegment = `/${pathnames.slice(0, index + 1).join("/")}`;
    const isParam = Object.values(params).includes(value);
    const seemsLikeId = /^\d+$/.test(value);

    const isLastSegment = index === pathnames.length - 1;
    if (isLastSegment && (seemsLikeId || isParam)) {
      return;
    }

    let name = routeNameMap[value] || value.replace(/-/g, " ");

    if (!routeNameMap[value] && !seemsLikeId) {
      name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    breadcrumbItems.push({ name, path: currentPathSegment });
  });

  return (
    <nav className="bg-gray-50 py-3 px-6 shadow-sm text-sm">
      <div className="max-w-7xl mx-auto flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.path}>
            {index > 0 && <span className="text-gray-400">/</span>}
            <Link
              to={item.path}
              className="flex items-center transition-color text-indigo-600 hover:text-indigo-800"
            >
              {item.name}
            </Link>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumbs;
