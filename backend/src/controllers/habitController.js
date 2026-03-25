const Habit = require("../models/Habit");
const { applyDailyReset, calculateUpdatedStreak } = require("../utils/habitHelpers");

async function getHabits(request, response, next) {
  try {
    const habits = await Habit.find().sort({ createdAt: -1 });

    // Reset completed flags when a new day starts.
    const updatedHabits = await Promise.all(
      habits.map(async (habit) => {
        const originalCompleted = habit.completed;
        applyDailyReset(habit);

        if (habit.completed !== originalCompleted) {
          await habit.save();
        }

        return habit;
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

    if (!name || !name.trim()) {
      return response.status(400).json({
        message: "Habit name is required.",
      });
    }

    const habit = await Habit.create({
      name: name.trim(),
    });

    response.status(201).json(habit);
  } catch (error) {
    next(error);
  }
}

async function updateHabit(request, response, next) {
  try {
    const { completed } = request.body;
    const habit = await Habit.findById(request.params.id);

    if (!habit) {
      return response.status(404).json({
        message: "Habit not found.",
      });
    }

    const updates = calculateUpdatedStreak(habit, completed);
    habit.completed = updates.completed;
    habit.lastCompletedDate = updates.lastCompletedDate;
    habit.streak = updates.streak;

    await habit.save();
    response.json(habit);
  } catch (error) {
    next(error);
  }
}

async function deleteHabit(request, response, next) {
  try {
    const habit = await Habit.findByIdAndDelete(request.params.id);

    if (!habit) {
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

