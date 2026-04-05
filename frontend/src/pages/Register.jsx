import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api";

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await register(name, email, password);
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
    <section className="auth-panel page-enter">
      <p className="eyebrow">Start fresh</p>
      <h2>Create your account</h2>
      <p className="muted">Set up your habit journal and keep your progress in one place.</p>
      <form onSubmit={submit}>
        <label>
          Full Name
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" required />
        </label>

        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>

        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required />
        </label>

        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Creating account..." : "Register"}</button>
        {error && <div className="error-msg">{error}</div>}
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}

export default RegisterPage;
