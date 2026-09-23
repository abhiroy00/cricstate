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
        <nav className="app-header-nav">
          <Link to="/matches">Matches</Link>
          <Link to="/teams">Teams</Link>
          <Link to="/players">Players</Link>
          <Link to="/tournaments">Tournaments</Link>
        </nav>
      )}
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
