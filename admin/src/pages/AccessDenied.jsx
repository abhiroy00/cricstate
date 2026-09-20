import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";

export default function AccessDenied() {
  const { logout } = useAuth();

  return (
    <div className="admin-auth-layout">
      <div className="admin-auth-card">
        <h1>Access denied</h1>
        <p className="auth-subtitle">Your account does not have an admin role.</p>
        <Button fullWidth onClick={logout}>
          Back to login
        </Button>
      </div>
    </div>
  );
}
