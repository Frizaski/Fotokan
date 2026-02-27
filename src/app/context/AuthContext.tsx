import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiFetch } from "../utils/api";

interface AuthState {
  isAuthenticated: boolean | null; // null = loading
  verifyPin: (pin: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // On mount, check if the device already has a valid cookie
  useEffect(() => {
    apiFetch("/api/auth/check")
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(data.authenticated === true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const verifyPin = async (pin: string) => {
    const res = await apiFetch("/api/auth/verify-pin", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (data.success) {
      setIsAuthenticated(true);
    }
    return data;
  };

  const logout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, verifyPin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
