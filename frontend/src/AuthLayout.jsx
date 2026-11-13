import { Navigate, Outlet } from "react-router";
import { useAuth } from "./Auth";

export function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
