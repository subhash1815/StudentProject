import { useEffect, useState } from "react";
import { fetchHabits, createHabit, toggleHabit, deleteHabit } from "../api";

function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [newHabit, setNewHabit] = useState("");

  const loadHabits = async () => {
    setLoading(true);
    setError("");
    setStatus("Loading habits...");

    try {
      const data = await fetchHabits();
      setHabits(data);
      setStatus(`Loaded ${data.length} habits.`);
    } catch (ex) {
      setError(ex.message);
      setStatus("Failed to load habits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (newHabit.trim().length === 0) return;

    try {
      setStatus("Adding habit...");
      await createHabit(newHabit);
      setNewHabit("");
      await loadHabits();
    } catch (ex) {
      setError(ex.message);
      setStatus("Failed to add habit.");
    }
  };

  const handleToggle = async (id, completed) => {
    try {
      setStatus("Updating habit...");
      await toggleHabit(id, !completed);
      await loadHabits();
    } catch (ex) {
      setError(ex.message);
      setStatus("Failed to update habit.");
    }
  };

  const handleDelete = async (id) => {
    try {
      setStatus("Removing habit...");
      await deleteHabit(id);
      await loadHabits();
    } catch (ex) {
      setError(ex.message);
      setStatus("Failed to delete habit.");
    }
  };

  const completedCount = habits.filter((h) => h.completed).length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

  return (
    <section className="panel page-enter">
      <div className="panel-header">
        <div>
          <h2>All Habits</h2>
          <p className="muted">Build steady routines and keep your streaks visible day by day.</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="habit-form">
        <input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="New habit name"
          required
          maxLength="80"
        />
        <button type="submit" className="primary-button">Add Habit</button>
      </form>

      <div className="summary-grid">
        <div><span>Total</span><strong>{habits.length}</strong></div>
        <div><span>Completed</span><strong>{completedCount}</strong></div>
        <div><span>Best Streak</span><strong>{bestStreak}</strong></div>
      </div>

      {status && <p className="status-message">{status}</p>}
      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <div className="loading-state" aria-live="polite">
          <div className="loading-card">
            <span className="loading-dot" />
            <div className="loading-lines">
              <span />
              <span />
            </div>
          </div>
          <div className="loading-card">
            <span className="loading-dot alternate" />
            <div className="loading-lines">
              <span />
              <span />
            </div>
          </div>
          <p>Loading your habit journal...</p>
        </div>
      ) : habits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">
            <div className="loading-card">
              <span className="loading-dot" />
              <div className="loading-lines">
                <span />
                <span />
              </div>
            </div>
            <div className="loading-card">
              <span className="loading-dot alternate" />
              <div className="loading-lines">
                <span />
                <span />
              </div>
            </div>
          </div>
          <h3>Welcome to Journal</h3>
          <p>Journal makes your habit progress visible day by day. Start with a single habit.</p>
          <div className="empty-actions">
            <button type="button" className="primary-button" onClick={() => document.querySelector(".habit-form input")?.focus()}>
              Build new Habit
            </button>
          </div>
        </div>
      ) : (
        <ul className="habit-list">
          {habits.map((habit) => (
            <li key={habit.id} className={`habit-card ${habit.completed ? "completed" : ""}`}>
              <div className="habit-meta">
                <strong>{habit.name}</strong>
                <p>Streak: {habit.streak || 0}</p>
              </div>
              <div className="actions">
                <button className="ghost-button" onClick={() => handleToggle(habit.id, habit.completed)}>
                  {habit.completed ? "Unmark" : "Mark Done"}
                </button>
                <button className="danger-button" onClick={() => handleDelete(habit.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default HabitsPage;
