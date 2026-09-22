import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import Button from "../common/Button";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <Link to="/" className="app-header-brand">
        🏏 CricState
      </Link>
      {user && (
        <div className="app-header-user">
          <Link to="/profile">{user.full_name}</Link>
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
