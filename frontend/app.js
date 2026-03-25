const habitForm = document.getElementById("habit-form");
const habitNameInput = document.getElementById("habit-name");
const habitList = document.getElementById("habit-list");
const statusMessage = document.getElementById("status-message");
const refreshButton = document.getElementById("refresh-button");
const totalCount = document.getElementById("total-count");
const completedCount = document.getElementById("completed-count");
const bestStreak = document.getElementById("best-streak");
const habitItemTemplate = document.getElementById("habit-item-template");

const apiBaseUrl = window.APP_CONFIG.API_BASE_URL;

async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Something went wrong.");
  }

  return response.json();
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(dateString));
}

function updateSummary(habits) {
  totalCount.textContent = habits.length;
  const completedHabits = habits.filter((habit) => habit.completed);
  completedCount.textContent = completedHabits.length;
  bestStreak.textContent = habits.reduce(
    (highest, habit) => Math.max(highest, habit.streak || 0),
    0
  );
}

function renderEmptyState() {
  habitList.innerHTML = '<li class="empty-state">No habits yet. Add your first one.</li>';
}

function createHabitCard(habit) {
  const card = habitItemTemplate.content.firstElementChild.cloneNode(true);
  const name = card.querySelector(".habit-name");
  const meta = card.querySelector(".habit-meta");
  const toggleButton = card.querySelector(".toggle-button");
  const deleteButton = card.querySelector(".delete-button");

  name.textContent = habit.name;
  meta.textContent = `Status: ${habit.completed ? "Completed today" : "Not completed today"} | Streak: ${habit.streak || 0} day(s) | Created: ${formatDate(habit.createdAt)}`;
  toggleButton.textContent = habit.completed ? "Completed" : "Mark Done";

  if (habit.completed) {
    card.classList.add("is-completed");
  }

  toggleButton.addEventListener("click", async () => {
    try {
      statusMessage.textContent = `Updating "${habit.name}"...`;
      await apiRequest(`/habits/${habit._id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: !habit.completed }),
      });
      await loadHabits("Habit updated.");
    } catch (error) {
      statusMessage.textContent = error.message;
    }
  });

  deleteButton.addEventListener("click", async () => {
    try {
      statusMessage.textContent = `Deleting "${habit.name}"...`;
      await apiRequest(`/habits/${habit._id}`, {
        method: "DELETE",
      });
      await loadHabits("Habit deleted.");
    } catch (error) {
      statusMessage.textContent = error.message;
    }
  });

  return card;
}

function renderHabits(habits) {
  updateSummary(habits);

  if (habits.length === 0) {
    renderEmptyState();
    return;
  }

  habitList.innerHTML = "";
  habits.forEach((habit) => {
    habitList.appendChild(createHabitCard(habit));
  });
}

async function loadHabits(successMessage = "Habits loaded.") {
  try {
    statusMessage.textContent = "Loading habits...";
    const habits = await apiRequest("/habits");
    renderHabits(habits);
    statusMessage.textContent = successMessage;
  } catch (error) {
    habitList.innerHTML = '<li class="empty-state">Unable to load habits. Check your backend connection.</li>';
    statusMessage.textContent = error.message;
  }
}

habitForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const habitName = habitNameInput.value.trim();
  if (!habitName) {
    statusMessage.textContent = "Please enter a habit name.";
    return;
  }

  try {
    statusMessage.textContent = "Adding habit...";
    await apiRequest("/habits", {
      method: "POST",
      body: JSON.stringify({ name: habitName }),
    });
    habitForm.reset();
    habitNameInput.focus();
    await loadHabits("Habit added.");
  } catch (error) {
    statusMessage.textContent = error.message;
  }
});

refreshButton.addEventListener("click", () => {
  loadHabits("Habits refreshed.");
});

loadHabits();

