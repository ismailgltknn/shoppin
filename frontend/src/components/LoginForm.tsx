import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { LogInIcon } from "lucide-react";

const LoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      navigate("/");
    } catch (error: any) {
      setError(error.response?.data?.message || "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-white/70 backdrop-blur-md p-10 flex flex-col justify-center">
          <h2 className="text-4xl font-bold text-indigo-600 mb-2">
            Hoş Geldiniz
          </h2>
          <p className="text-gray-600 text-lg">
            Alışverişe başlamak için hesabınıza giriş yapın.
          </p>
        </div>

        <div className="md:w-1/2 bg-white p-10">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Giriş Yap
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                E-posta
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-1"
              >
                Şifre
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition font-semibold cursor-pointer"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
              ) : (
                <>
                  <LogInIcon className="w-4 h-4" />
                  Giriş Yap
                </>
              )}
            </button>

            <div className="mt-4 text-center">
              Hesabınız yok mu?{" "}
              <Link
                to="/register"
                className="inline-block text-sm text-indigo-600 hover:text-indigo-500"
              >
                Kayıt Olun
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
