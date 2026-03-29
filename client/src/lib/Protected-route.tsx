import { Navigate } from "react-router-dom";
import { useAuth } from "./Auth-context";
import Loader from "@/components/loader/Loader";
import { type ReactNode } from "react";

// ✅ Your roles
export type Role = "admin" | "user" | "super-admin";

// ✅ Props
type ProtectedRouteProps = {
  element: ReactNode;
  roles?: Role[]; // optional → means any logged-in user
};

const ProtectedRoute = ({ element, roles }: ProtectedRouteProps) => {
  const { authLoader, user } = useAuth();

  // 🔄 Loading
  if (authLoader) {
    return <Loader />;
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Unauthorized (only if roles are provided)
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Authorized
  return <>{element}</>;
};

export default ProtectedRoute;
