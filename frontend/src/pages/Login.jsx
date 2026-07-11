import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState({ email: "agent@finsiem.local", password: "Password123!" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(credentials);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card panel" aria-labelledby="login-title">
        <div className="login-card__brand">
          <span><ShieldCheck size={24} /></span>
          <div>
            <strong>finSIEM</strong>
            <small>Decision Intelligence</small>
          </div>
        </div>
        <h1 id="login-title">Operational workspace login</h1>
        <p>Use the seeded Agent, Operator, or Management account after backend initialization.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={credentials.email}
              onChange={(event) => setCredentials({ ...credentials, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={credentials.password}
              onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
              required
            />
          </label>
          {error && <p className="login-card__error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? "Signing in" : "Sign in"}</button>
        </form>

        <div className="login-card__hint">
          <span>agent@finsiem.local</span>
          <span>operator@finsiem.local</span>
          <span>management@finsiem.local</span>
        </div>
      </section>
    </main>
  );
};

export default Login;
