import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      localStorage.setItem("habitTrackerToken", user.token);
      localStorage.setItem("habitTrackerUser", JSON.stringify({ id: user.id, name: user.name, email: user.email }));
      navigate("/habits");
    } catch (ex) {
      setError(ex.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-panel">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>

        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>

        <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        {error && <div className="error-msg">{error}</div>}
      </form>
      <p>
        New to this tracker? <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
}

export default LoginPage;
