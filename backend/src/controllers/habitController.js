const jwt = require("jsonwebtoken");
const { getDatabase } = require("../config/db");
const { applyDailyReset, calculateUpdatedStreak } = require("../utils/habitHelpers");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function getUserIdFromToken(request) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.userId;
  } catch {
    return null;
  }
}

async function getHabits(request, response, next) {
  try {
    const database = getDatabase();
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized." });
    }

    const [rows] = await database.query(
      `SELECT
        id,
        name,
        completed,
        streak,
        last_completed_date AS lastCompletedDate,
        created_at AS createdAt
      FROM habits
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [userId]
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

    const userId = getUserIdFromToken(request);
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized." });
    }

    const [result] = await database.query("INSERT INTO habits (user_id, name) VALUES (?, ?)", [
      userId,
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
      WHERE id = ? AND user_id = ?`,
      [result.insertId, userId]
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
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized." });
    }

    const [rows] = await database.query(
      `SELECT
        id,
        name,
        completed,
        streak,
        last_completed_date AS lastCompletedDate,
        created_at AS createdAt
      FROM habits
      WHERE id = ? AND user_id = ?`,
      [request.params.id, userId]
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
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized." });
    }

    const [result] = await database.query("DELETE FROM habits WHERE id = ? AND user_id = ?", [
      request.params.id,
      userId,
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
