import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ProfilePage from "./pages/Profile";
import HabitsPage from "./pages/Habits";

const privateRoutes = ["/habits", "/profile"];

function requireAuth() {
  return Boolean(localStorage.getItem("habitTrackerToken"));
}

function ProtectedRoute({ children }) {
  if (!requireAuth()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("habitTrackerToken");
    localStorage.removeItem("habitTrackerUser");
    navigate("/login");
  };

  const isAuthenticated = requireAuth();

  return (
    <div className="app-container">
      <header className="nav-bar">
        <Link className="brand" to="/">Habit Tracker</Link>
        <nav>
          {isAuthenticated ? (
            <>
              <Link to="/habits">Habits</Link>
              <Link to="/profile">Profile</Link>
              <button className="link-button" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/habits" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/habits" element={<ProtectedRoute><HabitsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
