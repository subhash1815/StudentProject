# Daily Habit Tracker

A beginner-friendly full-stack web app for adding habits, marking them complete for the day, tracking streaks, and storing data in MongoDB.

## Folder structure

```text
daily-habit-tracker/
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   └── habitController.js
│       ├── models/
│       │   └── Habit.js
│       ├── routes/
│       │   └── habitRoutes.js
│       └── utils/
│           └── habitHelpers.js
├── frontend/
│   ├── app.js
│   ├── config.js
│   ├── index.html
│   └── styles.css
├── .gitignore
└── README.md
```

## Features

- Add a new habit
- View all habits
- Mark a habit as completed for today
- Delete habits
- Save data in MongoDB
- Daily reset for the completed status
- Streak tracking

## Backend API

### `GET /api/habits`
Returns all habits.

### `POST /api/habits`
Creates a new habit.

Request body:

```json
{
  "name": "Exercise"
}
```

### `PUT /api/habits/:id`
Updates the completion status of a habit.

Request body:

```json
{
  "completed": true
}
```

### `DELETE /api/habits/:id`
Deletes a habit.

## Database setup

This project uses MongoDB with Mongoose.

### Option 1: Local MongoDB

1. Install MongoDB Community Edition.
2. Start MongoDB on your machine.
3. Copy `backend/.env.example` to `backend/.env`.
4. Keep the default local connection string:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/daily-habit-tracker
```

### Option 2: MongoDB Atlas

1. Create a free MongoDB Atlas cluster.
2. Create a database user.
3. Add your IP address to the network access list.
4. Copy the connection string from Atlas.
5. Paste it into `backend/.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/daily-habit-tracker?retryWrites=true&w=majority
```

## Step-by-step local setup

### 1. Clone the project

```bash
git clone <your-github-repo-url>
cd daily-habit-tracker
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Create environment variables

Create a new file named `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/daily-habit-tracker
CLIENT_URL=http://127.0.0.1:5500
```

### 4. Run the backend server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`.

### 5. Run the frontend

You can use the VS Code Live Server extension or any static server.

If you use Live Server, open `frontend/index.html` and run it. The default URL is usually:

```text
http://127.0.0.1:5500/frontend/index.html
```

The frontend already points to the local backend in `frontend/config.js`.

## Full frontend code

### `frontend/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Daily Habit Tracker</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Work+Sans:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <main class="app-shell">
      <section class="hero">
        <p class="eyebrow">Daily Habit Tracker</p>
        <h1>Build consistent routines one day at a time.</h1>
        <p class="hero-copy">
          Add habits, mark them done for today, and track your current streak.
        </p>
      </section>

      <section class="panel">
        <form id="habit-form" class="habit-form">
          <label class="sr-only" for="habit-name">Habit name</label>
          <input
            id="habit-name"
            name="habitName"
            type="text"
            placeholder="Enter a habit like Reading"
            maxlength="80"
            required
          />
          <button type="submit">Add Habit</button>
        </form>

        <div class="toolbar">
          <p id="status-message" class="status-message">Loading habits...</p>
          <button id="refresh-button" class="secondary-button" type="button">
            Refresh
          </button>
        </div>

        <section class="summary-grid" aria-label="Habit summary">
          <article class="summary-card">
            <span>Total Habits</span>
            <strong id="total-count">0</strong>
          </article>
          <article class="summary-card">
            <span>Completed Today</span>
            <strong id="completed-count">0</strong>
          </article>
          <article class="summary-card">
            <span>Longest Streak</span>
            <strong id="best-streak">0</strong>
          </article>
        </section>

        <section>
          <ul id="habit-list" class="habit-list" aria-live="polite"></ul>
        </section>
      </section>
    </main>

    <template id="habit-item-template">
      <li class="habit-card">
        <div class="habit-info">
          <h2 class="habit-name"></h2>
          <p class="habit-meta"></p>
        </div>
        <div class="habit-actions">
          <button class="toggle-button" type="button"></button>
          <button class="delete-button" type="button">Delete</button>
        </div>
      </li>
    </template>

    <script src="./config.js"></script>
    <script src="./app.js"></script>
  </body>
</html>
```

### `frontend/styles.css`

```css
:root {
  --background: #f4efe6;
  --panel: rgba(255, 250, 242, 0.82);
  --panel-border: rgba(93, 54, 29, 0.12);
  --text: #2b2118;
  --muted: #6b5a4b;
  --accent: #c65d2e;
  --accent-dark: #a6451b;
  --success: #2d7d46;
  --danger: #a12f2f;
  --shadow: 0 18px 50px rgba(85, 47, 24, 0.12);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: "Work Sans", sans-serif;
  color: var(--text);
  background:
    radial-gradient(circle at top, rgba(255, 220, 176, 0.7), transparent 35%),
    linear-gradient(135deg, #f7f0e5 0%, #efe1d1 52%, #ead5c0 100%);
}

button,
input {
  font: inherit;
}

.app-shell {
  width: min(1100px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 3rem 0 4rem;
}

.hero {
  margin-bottom: 1.75rem;
}

.eyebrow {
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.75rem;
  color: var(--accent-dark);
  font-weight: 700;
}

.hero h1 {
  margin: 0;
  max-width: 12ch;
  font-family: "Space Grotesk", sans-serif;
  font-size: clamp(2.4rem, 8vw, 4.5rem);
  line-height: 0.95;
}

.hero-copy {
  max-width: 42rem;
  margin-top: 1rem;
  color: var(--muted);
  font-size: 1.05rem;
}

.panel {
  background: var(--panel);
  backdrop-filter: blur(14px);
  border: 1px solid var(--panel-border);
  border-radius: 28px;
  box-shadow: var(--shadow);
  padding: 1.25rem;
}

.habit-form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
}

.habit-form input {
  width: 100%;
  border: 1px solid rgba(93, 54, 29, 0.18);
  border-radius: 18px;
  padding: 1rem 1.1rem;
  background: rgba(255, 255, 255, 0.76);
}

.habit-form button,
.secondary-button,
.toggle-button,
.delete-button {
  border: 0;
  border-radius: 18px;
  padding: 0.95rem 1.1rem;
  cursor: pointer;
  transition:
    transform 140ms ease,
    background-color 140ms ease,
    opacity 140ms ease;
}

.habit-form button,
.toggle-button {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}

.habit-form button:hover,
.toggle-button:hover {
  background: var(--accent-dark);
  transform: translateY(-1px);
}

.secondary-button {
  background: rgba(255, 255, 255, 0.72);
  color: var(--text);
}

.delete-button {
  background: rgba(161, 47, 47, 0.12);
  color: var(--danger);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0 1.2rem;
}

.status-message {
  margin: 0;
  color: var(--muted);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.summary-card {
  padding: 1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(93, 54, 29, 0.08);
}

.summary-card span {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--muted);
}

.summary-card strong {
  font-size: 1.9rem;
  font-family: "Space Grotesk", sans-serif;
}

.habit-list {
  display: grid;
  gap: 0.9rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.habit-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(93, 54, 29, 0.08);
}

.habit-name {
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
}

.habit-meta {
  margin: 0;
  color: var(--muted);
}

.habit-actions {
  display: flex;
  gap: 0.7rem;
  align-items: center;
}

.is-completed .habit-name {
  text-decoration: line-through;
}

.is-completed .toggle-button {
  background: var(--success);
}

.empty-state {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--muted);
  border: 1px dashed rgba(93, 54, 29, 0.18);
  border-radius: 18px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 760px) {
  .app-shell {
    width: min(100% - 1rem, 100%);
    padding-top: 1rem;
  }

  .panel {
    padding: 1rem;
    border-radius: 22px;
  }

  .habit-form,
  .summary-grid,
  .habit-card {
    grid-template-columns: 1fr;
  }

  .habit-card,
  .toolbar,
  .habit-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
```

### `frontend/config.js`

```javascript
window.APP_CONFIG = {
  API_BASE_URL: "http://localhost:5000/api",
};
```

### `frontend/app.js`

```javascript
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
```

## Full backend code

### `backend/package.json`

```json
{
  "name": "daily-habit-tracker-backend",
  "version": "1.0.0",
  "description": "Backend API for the Daily Habit Tracker project.",
  "main": "server.js",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  },
  "keywords": [
    "express",
    "mongodb",
    "habits"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.2",
    "mongoose": "^8.13.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
}
```

### `backend/server.js`

```javascript
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDatabase = require("./src/config/db");
const habitRoutes = require("./src/routes/habitRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

connectDatabase();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  })
);
app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    message: "Daily Habit Tracker API is running.",
  });
});

app.use("/api/habits", habitRoutes);

app.use((error, request, response, next) => {
  response.status(error.statusCode || 500).json({
    message: error.message || "Internal server error.",
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

### `backend/src/config/db.js`

```javascript
const mongoose = require("mongoose");

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = connectDatabase;
```

### `backend/src/models/Habit.js`

```javascript
const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastCompletedDate: {
      type: Date,
      default: null,
    },
    streak: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Habit", habitSchema);
```

### `backend/src/utils/habitHelpers.js`

```javascript
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
```

### `backend/src/controllers/habitController.js`

```javascript
const Habit = require("../models/Habit");
const { applyDailyReset, calculateUpdatedStreak } = require("../utils/habitHelpers");

async function getHabits(request, response, next) {
  try {
    const habits = await Habit.find().sort({ createdAt: -1 });

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
```

### `backend/src/routes/habitRoutes.js`

```javascript
const express = require("express");

const {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
} = require("../controllers/habitController");

const router = express.Router();

router.get("/", getHabits);
router.post("/", createHabit);
router.put("/:id", updateHabit);
router.delete("/:id", deleteHabit);

module.exports = router;
```

## Git workflow

### Initialize Git

```bash
git init
git branch -M main
```

### Commit step by step

```bash
git add .gitignore README.md
git commit -m "Add project documentation"

git add frontend
git commit -m "Create frontend for habit tracker"

git add backend
git commit -m "Create backend API and MongoDB models"
```

### Push to GitHub

```bash
git remote add origin https://github.com/<your-username>/daily-habit-tracker.git
git push -u origin main
```

## API testing with Postman

### Create a habit

- Method: `POST`
- URL: `http://localhost:5000/api/habits`
- Body:

```json
{
  "name": "Read 10 pages"
}
```

### Get all habits

- Method: `GET`
- URL: `http://localhost:5000/api/habits`

### Update completion status

- Method: `PUT`
- URL: `http://localhost:5000/api/habits/<habit-id>`
- Body:

```json
{
  "completed": true
}
```

### Delete a habit

- Method: `DELETE`
- URL: `http://localhost:5000/api/habits/<habit-id>`

## Deployment steps

### Deploy backend to Render

1. Push the code to GitHub.
2. Create a new Web Service on Render.
3. Select the GitHub repository.
4. Use these settings:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
5. Add environment variables in Render:
   - `PORT=5000`
   - `MONGODB_URI=<your-mongodb-atlas-uri>`
   - `CLIENT_URL=<your-netlify-or-vercel-frontend-url>`
6. Deploy and copy the live backend URL.

### Deploy frontend to Netlify

1. Create a new site from GitHub in Netlify.
2. Select the same repository.
3. Set the publish directory to `frontend`.
4. No build command is needed for this plain HTML/CSS/JS project.
5. After deployment, update `frontend/config.js`:

```javascript
window.APP_CONFIG = {
  API_BASE_URL: "https://your-render-app.onrender.com/api",
};
```

6. Commit and push the change again so Netlify redeploys the frontend.

### Alternative frontend deployment with Vercel

1. Import the GitHub repository into Vercel.
2. Set the root directory to `frontend`.
3. Deploy as a static site.
4. Update `frontend/config.js` with the live backend API URL.

## Modern workflow summary

1. Build the UI in the `frontend` folder.
2. Build REST APIs in the `backend` folder.
3. Connect MongoDB using Mongoose.
4. Test routes with Postman.
5. Use Git for version control.
6. Push the project to GitHub.
7. Deploy backend and frontend separately.

## Optional next improvements

- Add user authentication with JWT
- Add habit categories
- Show a calendar view of completed habits
- Add automated tests with Jest and Supertest
