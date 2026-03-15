import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

const STORAGE_KEY = "fotokan_auth";
const CORRECT_PIN = import.meta.env.VITE_PIN as string;

interface AuthState {
  isAuthenticated: boolean | null; // null = loading
  verifyPin: (pin: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // On mount, restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setIsAuthenticated(stored === "true");
  }, []);

  const verifyPin = async (pin: string) => {
    if (!CORRECT_PIN) {
      return { success: false, message: "PIN belum dikonfigurasi" };
    }
    if (pin === CORRECT_PIN) {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsAuthenticated(true);
      return { success: true, message: "OK" };
    }
    return { success: false, message: "PIN salah" };
  };

  const logout = async () => {
    localStorage.removeItem(STORAGE_KEY);
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
