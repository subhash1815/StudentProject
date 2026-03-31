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
    <section className="panel">
      <h2>My Habits</h2>

      <form onSubmit={handleAdd} className="habit-form">
        <input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="New habit name"
          required
          maxLength="80"
        />
        <button type="submit">Add</button>
      </form>

      <div className="summary-grid">
        <div>Total: {habits.length}</div>
        <div>Completed: {completedCount}</div>
        <div>Best Streak: {bestStreak}</div>
      </div>

      {status && <p className="status-message">{status}</p>}
      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : habits.length === 0 ? (
        <p>No habits yet. Add one now.</p>
      ) : (
        <ul className="habit-list">
          {habits.map((habit) => (
            <li key={habit.id} className={`habit-card ${habit.completed ? "completed" : ""}`}>
              <div>
                <strong>{habit.name}</strong>
                <p>Streak: {habit.streak || 0}</p>
              </div>
              <div className="actions">
                <button onClick={() => handleToggle(habit.id, habit.completed)}>
                  {habit.completed ? "Unmark" : "Mark Done"}
                </button>
                <button onClick={() => handleDelete(habit.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default HabitsPage;
