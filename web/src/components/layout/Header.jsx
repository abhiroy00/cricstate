import { useAuth } from "../../hooks/useAuth";
import Button from "../common/Button";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <span className="app-header-brand">🏏 CricState</span>
      {user && (
        <div className="app-header-user">
          <span>{user.full_name}</span>
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
