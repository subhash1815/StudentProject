function getStartOfDay(dateInput = new Date()) {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isSameDay(firstDate, secondDate) {
  return getStartOfDay(firstDate).getTime() === getStartOfDay(secondDate).getTime();
}

function isYesterday(lastDate, currentDate) {
  const previousDay = getStartOfDay(currentDate);
  previousDay.setDate(previousDay.getDate() - 1);
  return getStartOfDay(lastDate).getTime() === previousDay.getTime();
}

function applyDailyReset(habit) {
  if (!habit.completed || !habit.lastCompletedDate) {
    return habit;
  }

  if (!isSameDay(habit.lastCompletedDate, new Date())) {
    habit.completed = false;
  }

  return habit;
}

function calculateUpdatedStreak(habit, completed) {
  const today = new Date();

  if (!completed) {
    return {
      completed: false,
      lastCompletedDate: habit.lastCompletedDate,
      streak: habit.streak,
    };
  }

  if (!habit.lastCompletedDate) {
    return {
      completed: true,
      lastCompletedDate: today,
      streak: 1,
    };
  }

  if (isSameDay(habit.lastCompletedDate, today)) {
    return {
      completed: true,
      lastCompletedDate: habit.lastCompletedDate,
      streak: habit.streak,
    };
  }

  if (isYesterday(habit.lastCompletedDate, today)) {
    return {
      completed: true,
      lastCompletedDate: today,
      streak: habit.streak + 1,
    };
  }

  return {
    completed: true,
    lastCompletedDate: today,
    streak: 1,
  };
}

module.exports = {
  applyDailyReset,
  calculateUpdatedStreak,
};

