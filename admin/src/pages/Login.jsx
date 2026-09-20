import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-auth-layout">
      <form className="admin-auth-card" onSubmit={handleSubmit}>
        <div className="admin-auth-brand">🏏 CricState Admin</div>
        <h1>Admin sign in</h1>
        <p className="auth-subtitle">Access is restricted to admin roles.</p>

        <Input
          id="identifier"
          label="Email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="form-error-banner">{error}</p>}

        <Button type="submit" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>
    </div>
  );
}
