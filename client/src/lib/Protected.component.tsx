import React from "react";
import { useAuth } from "./Auth-context";

export type Role = "admin" | "user" | "super-admin";

export default function ProtectedComponent({
  component,
  role,
  fallback = null,
}: {
  component: React.ReactNode;
  role?: Role;
  // Rendered instead of `component` when the visitor is anonymous — the
  // answer-reveal toggles use it to show a "log in" prompt rather than
  // an empty box (the API omits answer fields for anonymous callers).
  fallback?: React.ReactNode;
}) {
  const { user, authLoader } = useAuth();

  if (!user || authLoader) {
    return <>{fallback}</>;
  }

  if (role && user.role !== role) {
    return <>{fallback}</>;
  }

  return <>{component}</>;
}
