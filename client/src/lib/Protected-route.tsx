import { Navigate } from "react-router-dom";
import { useAuth } from "./Auth-context";
import Loader from "@/components/loader/Loader";

const ProtectedRoute = ({ element: Component, roles }) => {
  const { authLoader, user } = useAuth();
  if (authLoader) {
    return <Loader />;
  }

  if (!user) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" />;
  }

  if (!roles.includes(user?.role) && !roles.includes("all")) {
    console.log(2);
    // Redirect to home if the actionName is false
    return <Navigate to="/" />;
  }

  // Render the component if authenticated and actionName is valid
  return Component;
};

export default ProtectedRoute;
