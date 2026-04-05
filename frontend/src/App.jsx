import { Routes, Route, Navigate, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("habitTrackerToken");
    localStorage.removeItem("habitTrackerUser");
    navigate("/login");
  };

  const isAuthenticated = requireAuth();
  const storedUser = localStorage.getItem("habitTrackerUser");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const pageTitle = location.pathname === "/profile" ? "Profile" : "Today";

  if (!isAuthenticated) {
    return (
      <div className="app-container auth-layout">
        <header className="auth-topbar">
          <Link className="brand" to="/">Daily Habit Tracker</Link>
          <nav className="auth-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </nav>
        </header>

        <main className="auth-main">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container dashboard-layout">
      <aside className="sidebar">
        <Link className="brand sidebar-brand" to="/habits">
          <span className="brand-mark">◌</span>
          <span>Daily Habit Tracker</span>
        </Link>

        <div className="profile-card fade">
          <div className="profile-avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</div>
          <div>
            <strong>{user?.name || "User"}</strong>
            <p>{user?.email || "Habit journal"}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/habits" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            All Habits
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            Profile
          </NavLink>
        </nav>

        <div className="sidebar-section">
          <span className="sidebar-label">Time of Day</span>
          <div className="sidebar-item">Morning</div>
          <div className="sidebar-item">Afternoon</div>
          <div className="sidebar-item accent-dot">Evening</div>
        </div>

        <div className="sidebar-footer">
          <button className="link-button sidebar-logout" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="content-shell">
        <header className="content-topbar">
          <div>
            <p className="eyebrow">Journal</p>
            <h1>{pageTitle}</h1>
          </div>
          <div className="view-toggle" aria-hidden="true">
            <span>Grid</span>
            <span className="active">List</span>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/habits" replace />} />
          <Route path="/login" element={<Navigate to="/habits" replace />} />
          <Route path="/register" element={<Navigate to="/habits" replace />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/habits" element={<ProtectedRoute><HabitsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/habits" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
