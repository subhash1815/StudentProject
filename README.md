# Daily Habit Tracker

A beginner-friendly full-stack web app for adding habits, marking them complete for the day, tracking streaks, and storing data in a local MySQL database.

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
│       ├── database/
│       │   └── schema.sql
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
- Delete a habit
- Store data in MySQL
- Daily reset for the completed flag
- Streak tracking

## Backend API

### `GET /api/habits`
Returns all habits.

### `POST /api/habits`
Creates a new habit.

```json
{
  "name": "Exercise"
}
```

### `PUT /api/habits/:id`
Updates the completion status.

```json
{
  "completed": true
}
```

### `DELETE /api/habits/:id`
Deletes a habit.

## Local MySQL setup

This project now uses MySQL for local development.

### 1. Create the database

Run the SQL file in [backend/src/database/schema.sql](/home/knightx/StudentProject/backend/src/database/schema.sql):

```bash
mysql -u root -p < backend/src/database/schema.sql
```

That creates:

- Database: `daily_habit_tracker`
- Table: `habits`

### 2. Create environment variables

Copy `backend/.env.example` to `backend/.env` and update the password if needed:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=daily_habit_tracker
CLIENT_URL=http://127.0.0.1:5500
```

## Local development

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Start the backend

```bash
npm run dev
```

The API will run at `http://localhost:5000`.

### 3. Start the frontend

Use VS Code Live Server or any static server to open [frontend/index.html](/home/knightx/StudentProject/frontend/index.html).

The frontend already points to:

```javascript
window.APP_CONFIG = {
  API_BASE_URL: "http://localhost:5000/api",
};
```

## Database table

The `habits` table stores:

- `id` - integer primary key
- `name` - habit name
- `completed` - true or false
- `streak` - current streak count
- `last_completed_date` - last day the habit was marked complete
- `created_at` - created timestamp

## Git workflow

```bash
git init
git branch -M main

git add .gitignore README.md
git commit -m "Add project documentation"

git add frontend
git commit -m "Create frontend for habit tracker"

git add backend
git commit -m "Create backend API and MySQL integration"
```

Push to GitHub:

```bash
git remote add origin https://github.com/<your-username>/daily-habit-tracker.git
git push -u origin main
```

## API testing with Postman

### Create a habit

- `POST http://localhost:5000/api/habits`

```json
{
  "name": "Read 10 pages"
}
```

### Get all habits

- `GET http://localhost:5000/api/habits`

### Mark a habit complete

- `PUT http://localhost:5000/api/habits/1`

```json
{
  "completed": true
}
```

### Delete a habit

- `DELETE http://localhost:5000/api/habits/1`

## Deployment notes

For deployment, use a hosted MySQL provider or Render/Railway MySQL-compatible database and set:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `CLIENT_URL`

After deploying the backend, update [frontend/config.js](/home/knightx/StudentProject/frontend/config.js) with the live backend URL.
