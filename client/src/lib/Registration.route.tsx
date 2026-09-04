import { type ReactNode } from "react";
import Loader from "@/components/loader/Loader";
import { useAuth } from "./Auth-context";
import { Navigate } from "react-router-dom";

export default function RegistrationRoute({ element }: { element: ReactNode }) {
  const { user, authLoader } = useAuth();
  if (authLoader) return <Loader />;

  if (user) {
    return <Navigate to={"/"} />;
  }

  return <>{element}</>;
}
