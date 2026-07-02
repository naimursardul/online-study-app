import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./Auth-context";
import Loader from "@/components/loader/Loader";
import { type ReactNode } from "react";

// ✅ Your roles
export type Role = "admin" | "user" | "super-admin";

// ✅ Props
type ProtectedRouteProps = {
  element: ReactNode;
  roles?: Role[];
};

const ProtectedRoute = ({ element, roles }: ProtectedRouteProps) => {
  const { authLoader, user } = useAuth();
  const location = useLocation();

  // 🔄 Loading
  if (authLoader) {
    return <Loader />;
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ❌ Unauthorized (only if roles are provided)
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Authorized
  return <>{element}</>;
};

export default ProtectedRoute;
