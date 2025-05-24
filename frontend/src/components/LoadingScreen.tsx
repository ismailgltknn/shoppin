import React from "react";
import Spinner from "./Spinner";

interface LoadingScreenProps {
  message?: string;
  exit?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Yükleniyor...",
  exit = false,
}) => {
  const appName = import.meta.env.VITE_APP_NAME || "Uygulama";

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-100 text-gray-800 transition-transform duration-700 ease-in-out ${
        exit ? "slide-out" : "slide-in"
      }`}
    >
      <div
        className="text-3xl font-semibold mb-4"
        style={{
          opacity: 0,
          transform: "translateY(10px)",
          animation: "fadeIn 0.6s ease-out forwards",
        }}
      >
        {appName}
      </div>
      <div
        className="text-base mb-6"
        style={{
          opacity: 0,
          animation: "fadeIn 0.6s ease-out forwards",
          animationDelay: "150ms",
        }}
      >
        {message}
      </div>
      <div className="animate-pulse">
        <Spinner size="lg" color="text-indigo-600" />
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .slide-in {
            transform: translateX(0);
          }
          .slide-out {
            transform: translateX(100%);
          }
        `}
      </style>
    </div>
  );
};

export default LoadingScreen;
