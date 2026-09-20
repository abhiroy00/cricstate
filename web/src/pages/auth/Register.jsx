import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { extractErrorMessage } from "../../services/api";

const INITIAL_FORM = { fullName: "", email: "", username: "", password: "" };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>Create your account</h1>
      <p className="auth-subtitle">Join the cricket community in a few seconds.</p>

      <Input
        id="fullName"
        label="Full name"
        value={form.fullName}
        onChange={updateField("fullName")}
        required
      />
      <Input
        id="email"
        label="Email"
        type="email"
        value={form.email}
        onChange={updateField("email")}
        autoComplete="email"
        required
      />
      <Input
        id="username"
        label="Username"
        value={form.username}
        onChange={updateField("username")}
        autoComplete="username"
        required
      />
      <Input
        id="password"
        label="Password"
        type="password"
        value={form.password}
        onChange={updateField("password")}
        autoComplete="new-password"
        required
      />

      {error && <p className="form-error-banner">{error}</p>}

      <Button type="submit" fullWidth loading={loading}>
        Create account
      </Button>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </form>
  );
}
