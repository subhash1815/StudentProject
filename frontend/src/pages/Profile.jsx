import { useEffect, useState } from "react";
import { fetchProfile, deleteAccount } from "../api";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchProfile();
        setProfile(data);
      } catch (ex) {
        setError(ex.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="panel page-enter">
        <div className="loading-state" aria-live="polite">
          <div className="loading-card">
            <span className="loading-dot" />
            <div className="loading-lines">
              <span />
              <span />
            </div>
          </div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="panel error-msg">{error}</div>;
  }

  const handleDelete = async () => {
    if (!deletePassword) {
      setError("Please enter your password to delete account.");
      return;
    }

    const confirmed = window.confirm(
      "This action will permanently delete your account and all habits. Do you want to continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      await deleteAccount(deletePassword);
      localStorage.removeItem("habitTrackerToken");
      localStorage.removeItem("habitTrackerUser");
      window.location.href = "/login";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setDeletePassword("");
    }
  };

  return (
    <section className="panel page-enter">
      <div className="panel-header">
        <div>
          <h2>My Profile</h2>
          <p className="muted">Keep your account details and journal access in sync.</p>
        </div>
      </div>
      <div className="profile-summary">
        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <p>
          <strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="delete-account-box">
        <h3>Delete account</h3>
        <p className="muted">Enter your password and click Delete to permanently remove your account.</p>
        <label>
          Confirm password
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Password"
          />
        </label>
        <button className="danger-button" onClick={handleDelete} disabled={loading}>
          {loading ? "Deleting…" : "Delete account"}
        </button>
      </div>
    </section>
  );
}

export default ProfilePage;
