import React from "react";
import { Link } from "react-router-dom";
import { FrownIcon } from "lucide-react";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-sm shadow-lg p-8 sm:p-12 text-center max-w-md w-full">
        <FrownIcon className="w-24 h-24 text-indigo-500 mx-auto mb-6" />
        <h1 className="text-6xl font-extrabold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          Üzgünüz, aradığınız sayfa bulunamadı.
        </p>
        <p className="text-gray-500 mb-8">
          Belki yanlış bir adres girdiniz veya sayfa taşınmış olabilir.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Anasayfaya Dön
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
