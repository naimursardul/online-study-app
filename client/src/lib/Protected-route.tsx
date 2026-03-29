import { Navigate } from "react-router-dom";
import { useAuth } from "./Auth-context";
import Loader from "@/components/loader/Loader";
import { type ReactNode } from "react";

// 👉 Define allowed roles
type Role = "admin" | "user" | "super-admin"; // adjust based on your app

// 👉 Props type
type ProtectedRouteProps = {
  element: ReactNode;
  roles: Role[];
};

const ProtectedRoute = ({ element, roles }: ProtectedRouteProps) => {
  const { authLoader, user } = useAuth();

  // 🔄 Loading state
  if (authLoader) {
    return <Loader />;
  }

  // ❌ Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Unauthorized
  if (!roles.includes("all") && !roles.includes(user.role as Role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Authorized
  return <>{element}</>;
};

export default ProtectedRoute;
