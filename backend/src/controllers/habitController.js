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

    const result = await database.query(
      `SELECT
        id,
        name,
        completed,
        streak,
        last_completed_date AS "lastCompletedDate",
        created_at AS "createdAt"
      FROM habits
      WHERE user_id = $1
      ORDER BY created_at DESC`,
      [userId]
    );

    const updatedHabits = await Promise.all(
      result.rows.map(async (habit) => {
        const normalizedHabit = {
          ...habit,
          completed: Boolean(habit.completed),
        };
        const originalCompleted = normalizedHabit.completed;
        applyDailyReset(normalizedHabit);

        if (normalizedHabit.completed !== originalCompleted) {
          await database.query("UPDATE habits SET completed = $1 WHERE id = $2", [
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

    const result = await database.query(
      "INSERT INTO habits (user_id, name) VALUES ($1, $2) RETURNING id",
      [userId, name.trim()]
    );
    const habitId = result.rows[0].id;

    const rows = await database.query(
      `SELECT
        id,
        name,
        completed,
        streak,
        last_completed_date AS "lastCompletedDate",
        created_at AS "createdAt"
      FROM habits
      WHERE id = $1 AND user_id = $2`,
      [habitId, userId]
    );

    response.status(201).json({
      ...rows.rows[0],
      completed: Boolean(rows.rows[0].completed),
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

    const rows = await database.query(
      `SELECT
        id,
        name,
        completed,
        streak,
        last_completed_date AS "lastCompletedDate",
        created_at AS "createdAt"
      FROM habits
      WHERE id = $1 AND user_id = $2`,
      [request.params.id, userId]
    );

    if (rows.rows.length === 0) {
      return response.status(404).json({
        message: "Habit not found.",
      });
    }

    const habit = {
      ...rows.rows[0],
      completed: Boolean(rows.rows[0].completed),
    };
    const updates = calculateUpdatedStreak(habit, completed);

    await database.query(
      `UPDATE habits
      SET completed = $1, last_completed_date = $2, streak = $3
      WHERE id = $4`,
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

    const result = await database.query("DELETE FROM habits WHERE id = $1 AND user_id = $2", [
      request.params.id,
      userId,
    ]);

    if (result.rowCount === 0) {
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
