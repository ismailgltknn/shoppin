import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import React from "react";

interface ProtectedRouteProps {
  requiredRoles?: string[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRoles,
  redirectPath = "/", // Varsayılan değer olarak anasayfa
}) => {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  // 1. Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 2. Eğer belirli roller gerekiyorsa ve kullanıcı bu rollere sahip değilse
  if (
    requiredRoles &&
    (!user || !user.role || !requiredRoles.includes(user.role))
  ) {
    return <Navigate to={redirectPath} replace />;
  }

  // Tüm kontrollerden geçirilirse, child rotayı render et
  return <Outlet />;
};

export default ProtectedRoute;
