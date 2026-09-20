import { NavLink, Outlet } from "react-router-dom";

import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { SIDEBAR_LINKS } from "../utils/sidebarLinks";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">🏏 CricState Admin</div>
        <nav className="admin-nav">
          {SIDEBAR_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
              end={link.path === "/"}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <span>{user?.full_name}</span>
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
