import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

/**
 * Route guard that checks authentication status.
 * - null (loading) → shows a loading spinner
 * - false → redirects to /pin
 * - true → renders child routes
 */
export default function AuthGuard() {
  const { isAuthenticated } = useAuth();

  // Still checking cookie with backend
  if (isAuthenticated === null) {
    return (
      <div className="size-full flex items-center justify-center bg-[#0f0f2e] text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/pin" replace />;
  }

  return <Outlet />;
}
