import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-brand">🏏 CricState</div>
        <Outlet />
      </div>
    </div>
  );
}
