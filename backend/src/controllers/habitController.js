const { getDatabase } = require("../config/db");
const { applyDailyReset, calculateUpdatedStreak } = require("../utils/habitHelpers");

async function getHabits(request, response, next) {
  try {
    const database = getDatabase();
    const [rows] = await database.query(
      `SELECT
        id,
        name,
        completed,
        streak,
        last_completed_date AS lastCompletedDate,
        created_at AS createdAt
      FROM habits
      ORDER BY created_at DESC`
    );

    const updatedHabits = await Promise.all(
      rows.map(async (habit) => {
        const normalizedHabit = {
          ...habit,
          completed: Boolean(habit.completed),
        };
        const originalCompleted = normalizedHabit.completed;
        applyDailyReset(normalizedHabit);

        if (normalizedHabit.completed !== originalCompleted) {
          await database.query("UPDATE habits SET completed = ? WHERE id = ?", [
            normalizedHabit.completed,
            normalizedHabit.id,
          ]);
        }

        return normalizedHabit;
      })
    );

    response.json(updatedHabits);
  } catch (error) {
    next(error);
  }
}

async function createHabit(request, response, next) {
  try {
    const { name } = request.body;
    const database = getDatabase();

    if (!name || !name.trim()) {
      return response.status(400).json({
        message: "Habit name is required.",
      });
    }

    const [result] = await database.query("INSERT INTO habits (name) VALUES (?)", [
      name.trim(),
    ]);

    const [rows] = await database.query(
      `SELECT
        id,
        name,
        completed,
        streak,
        last_completed_date AS lastCompletedDate,
        created_at AS createdAt
      FROM habits
      WHERE id = ?`,
      [result.insertId]
    );

    response.status(201).json({
      ...rows[0],
      completed: Boolean(rows[0].completed),
    });
  } catch (error) {
    next(error);
  }
}

async function updateHabit(request, response, next) {
  try {
    const { completed } = request.body;
    const database = getDatabase();
    const [rows] = await database.query(
      `SELECT
        id,
        name,
        completed,
        streak,
        last_completed_date AS lastCompletedDate,
        created_at AS createdAt
      FROM habits
      WHERE id = ?`,
      [request.params.id]
    );

    if (rows.length === 0) {
      return response.status(404).json({
        message: "Habit not found.",
      });
    }

    const habit = {
      ...rows[0],
      completed: Boolean(rows[0].completed),
    };
    const updates = calculateUpdatedStreak(habit, completed);

    await database.query(
      `UPDATE habits
      SET completed = ?, last_completed_date = ?, streak = ?
      WHERE id = ?`,
      [updates.completed, updates.lastCompletedDate, updates.streak, request.params.id]
    );

    response.json({
      ...habit,
      completed: updates.completed,
      lastCompletedDate: updates.lastCompletedDate,
      streak: updates.streak,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteHabit(request, response, next) {
  try {
    const database = getDatabase();
    const [result] = await database.query("DELETE FROM habits WHERE id = ?", [
      request.params.id,
    ]);

    if (result.affectedRows === 0) {
      return response.status(404).json({
        message: "Habit not found.",
      });
    }

    response.json({
      message: "Habit deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
};
