import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import axiosInstance from "../api/axiosInstance";
import axios from "axios";
import Cookies from "js-cookie";

interface User {
  id: number;
  name: string;
  email: string;
  shipping_address: string | null;
  billing_address: string | null;
  role: string | null;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoggedIn: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  updateUser: (updatedUserData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get("/me");
      setUser(response.data);
      setIsLoggedIn(true);
    } catch {
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      const xsrfToken = Cookies.get("XSRF-TOKEN");

      await axios.post(
        "http://localhost:8000/login",
        { email, password },
        {
          withCredentials: true,
          headers: {
            "X-XSRF-TOKEN": xsrfToken ? decodeURIComponent(xsrfToken) : "",
            "Content-Type": "application/json",
          },
        }
      );

      await fetchUser();
    } catch (error: any) {
      setUser(null);
      setIsLoggedIn(false);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const xsrfToken = Cookies.get("XSRF-TOKEN");

      await axios.post(
        "http://localhost:8000/logout",
        {},
        {
          withCredentials: true,
          headers: {
            "X-XSRF-TOKEN": xsrfToken ? decodeURIComponent(xsrfToken) : "",
            "Content-Type": "application/json",
          },
        }
      );
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      setLoading(false);
    }
  };

  const register = async ({
    name,
    email,
    password,
    password_confirmation,
  }: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    try {
      const xsrfToken = Cookies.get("XSRF-TOKEN");

      await axios.post(
        "http://localhost:8000/register",
        { name, email, password, password_confirmation },
        {
          withCredentials: true,
          headers: {
            "X-XSRF-TOKEN": xsrfToken ? decodeURIComponent(xsrfToken) : "",
            "Content-Type": "application/json",
          },
        }
      );

      await login({ email, password });
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const updateUser = (updatedUserData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, ...updatedUserData };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        login,
        logout,
        register,
        loading,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
