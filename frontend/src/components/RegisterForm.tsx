import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { FileCheckIcon } from "lucide-react";
import Spinner from "../components/Spinner";

interface ValidationErrors {
  [key: string]: string[];
}

const RegisterForm = () => {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
      });
      navigate("/");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const validationErrors = err.response?.data?.errors as
          | ValidationErrors
          | undefined;
        if (validationErrors) {
          const firstError = Object.values(validationErrors)[0]?.[0];
          setError(firstError || "Bir doğrulama hatası oluştu.");
        } else {
          setError("Kayıt sırasında bir hata oluştu.");
        }
      } else {
        setError("Beklenmeyen bir hata oluştu.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-white/70 backdrop-blur-md p-10 flex flex-col justify-center">
          <h2 className="text-4xl font-bold text-indigo-600 mb-2">
            Shoppin'e Katılın!
          </h2>
          <p className="text-gray-600 text-lg">
            Yeni bir hesap oluşturarak alışverişe başlayın.
          </p>
        </div>

        <div className="md:w-1/2 bg-white p-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Yeni Hesap Oluştur
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong className="font-bold">Hata!</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            )}
            <input
              type="text"
              placeholder="Adınız Soyadınız"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Şifre Tekrar"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition font-semibold cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <Spinner size="sm" color="text-white" />
              ) : (
                <>
                  <FileCheckIcon className="w-4 h-4" />
                  Kayıt Ol
                </>
              )}
            </button>

            <div className="mt-4 text-center">
              Zaten bir hesabınız var mı?{" "}
              <Link to="/login" className="text-indigo-600 hover:underline">
                Giriş Yapın
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
