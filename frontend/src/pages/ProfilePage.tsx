import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "../api/axiosInstance";
import Spinner from "../components/Spinner";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  shipping_address: string | null;
  billing_address: string | null;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    shipping_address: "",
    billing_address: "",
    password: "",
    password_confirmation: "",
    current_password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (user) {
      setProfile({
        id: user.id,
        name: user.name,
        email: user.email,
        shipping_address: user.shipping_address || "",
        billing_address: user.billing_address || "",
      });
      setFormData({
        name: user.name,
        email: user.email,
        shipping_address: user.shipping_address || "",
        billing_address: user.billing_address || "",
        password: "",
        password_confirmation: "",
        current_password: "",
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.put("/user/profile", formData);
      setSuccess(response.data.message);
      updateUser(response.data.user);
      setProfile(response.data.user);
      setEditing(false);
      setFormData({
        ...formData,
        password: "",
        password_confirmation: "",
        current_password: "",
      });
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .join(" ");
        setError(errorMessages);
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        setError(err.response.data.message);
      } else {
        setError("Profil güncellenirken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Spinner size="lg" color="text-indigo-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center text-red-600 p-8 bg-white rounded-lg shadow-md">
          Profil bilgileri yüklenemedi. Lütfen giriş yaptığınızdan emin olun.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-5xl w-full bg-white rounded-sm shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
          <h1 className="text-4xl font-extrabold mb-2">Profilim</h1>
          <p className="text-indigo-100 text-lg">
            Bilgilerinizi buradan görüntüleyebilir ve güncelleyebilirsiniz.
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
              role="alert"
            >
              <strong className="font-bold">Hata!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          {success && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
              role="alert"
            >
              <strong className="font-bold">Başarılı!</strong>
              <span className="block sm:inline"> {success}</span>
            </div>
          )}

          {!editing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Adınız:
                  </label>
                  <p className="text-lg text-gray-900">{profile.name}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    E-posta:
                  </label>
                  <p className="text-lg text-gray-900">{profile.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Gönderim Adresi:
                  </label>
                  <p className="text-lg text-gray-900 whitespace-pre-wrap">
                    {profile.shipping_address || "Belirtilmemiş"}
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Fatura Adresi:
                  </label>
                  <p className="text-lg text-gray-900 whitespace-pre-wrap">
                    {profile.billing_address || "Belirtilmemiş"}
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setEditing(true)}
                  className="cursor-pointer px-8 py-3 w-full bg-indigo-600 text-white font-semibold rounded-sm shadow-md hover:bg-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-lg"
                >
                  Profili Düzenle
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Adınız:
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    E-posta:
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="shipping_address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Gönderim Adresi:
                </label>
                <textarea
                  id="shipping_address"
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                  placeholder="Gönderim adresinizi girin"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="billing_address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fatura Adresi:
                </label>
                <textarea
                  id="billing_address"
                  name="billing_address"
                  value={formData.billing_address}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                  placeholder="Fatura adresinizi girin"
                ></textarea>
              </div>

              <div className="border-t border-gray-200 pt-8 mt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  Şifre Güncelleme (İsteğe Bağlı)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="current_password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Mevcut Şifre:
                    </label>
                    <input
                      type="password"
                      id="current_password"
                      name="current_password"
                      value={formData.current_password}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                      placeholder="Mevcut şifrenizi girin"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Yeni Şifre:
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                      placeholder="Yeni şifrenizi girin"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label
                    htmlFor="password_confirmation"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Yeni Şifre Tekrar:
                  </label>
                  <input
                    type="password"
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                    placeholder="Yeni şifrenizi tekrar girin"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="cursor-pointer px-8 py-2 border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-8 py-2 bg-indigo-600 text-white font-semibold rounded-sm shadow-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner size="sm" color="text-white" />
                  ) : (
                    "Güncelle"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
