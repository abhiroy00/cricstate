import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import AccessDenied from "../pages/AccessDenied";
import ComingSoon from "../pages/ComingSoon";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import { SIDEBAR_LINKS } from "../utils/sidebarLinks";
import PrivateRoute from "./PrivateRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          {SIDEBAR_LINKS.filter((link) => !link.implemented).map((link) => (
            <Route key={link.path} path={link.path} element={<ComingSoon />} />
          ))}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
