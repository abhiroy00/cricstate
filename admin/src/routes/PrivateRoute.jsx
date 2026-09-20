import { Navigate, Outlet } from "react-router-dom";

import Loader from "../components/Loader";
import { useAuth } from "../hooks/useAuth";

export default function PrivateRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader label="Checking session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}
