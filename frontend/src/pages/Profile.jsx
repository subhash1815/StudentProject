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
    return <div className="panel">Loading profile...</div>;
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
    <section className="panel">
      <h2>My Profile</h2>
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
        <button onClick={handleDelete} style={{ background: "#cc4b37", color: "white" }} disabled={loading}>
          {loading ? "Deleting…" : "Delete account"}
        </button>
      </div>
    </section>
  );
}

export default ProfilePage;
