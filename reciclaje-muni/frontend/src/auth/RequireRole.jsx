import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function RequireRole({ allowed, children }) {
  const { user } = useAuth();
  const role = user?.rol;

  if (!role) return <Navigate to="/login" replace />;
  if (!allowed.includes(role)) return <Navigate to="/dashboard" replace />;

  return children;
}