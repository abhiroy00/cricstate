import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { extractErrorMessage } from "../../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>Welcome back</h1>
      <p className="auth-subtitle">Log in to follow live matches, teams and players.</p>

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
        Log in
      </Button>

      <p className="auth-switch">
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}
