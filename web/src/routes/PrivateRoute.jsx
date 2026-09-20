import { Navigate, Outlet, useLocation } from "react-router-dom";

import Loader from "../components/common/Loader";
import { useAuth } from "../hooks/useAuth";

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader label="Checking session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
