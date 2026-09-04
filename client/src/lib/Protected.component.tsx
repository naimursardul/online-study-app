import React from "react";
import { useAuth } from "./Auth-context";

export type Role = "admin" | "user" | "super-admin";

export default function ProtectedComponent({
  component,
  role,
}: {
  component: React.ReactNode;
  role?: Role;
}) {
  const { user, authLoader } = useAuth();

  if (!user || authLoader) {
    return null;
  }

  if (role && user.role !== role) {
    return null;
  }

  return <>{component}</>;
}
