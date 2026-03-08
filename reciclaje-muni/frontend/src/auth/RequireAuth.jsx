import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function RequireAuth({ children }) {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  if (user?.rol === "CIUDADANO") {
    return <Navigate to="/ciudadano/dashboard" replace />;
  }

  return children;
}