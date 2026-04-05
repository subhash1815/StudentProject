# Daily Habit Tracker

A beginner-friendly full-stack web app for adding habits, marking them complete for the day, tracking streaks, and storing data in PostgreSQL.

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
- Store data in PostgreSQL
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

## Local PostgreSQL setup

This project now uses PostgreSQL for local development and Render deployment.

### Option A: Run PostgreSQL with Docker

Use Docker Compose from the project root:

```bash
docker compose up -d
```

This pulls the official `postgres:16` image, starts a local database on `127.0.0.1:5432`, and initializes the schema automatically from [backend/src/database/schema.sql](/home/knightx/StudentProject/backend/src/database/schema.sql).

The default container credentials match [backend/.env.example](/home/knightx/StudentProject/backend/.env.example):

- `DB_HOST=127.0.0.1`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`
- `DB_NAME=daily_habit_tracker`

To stop it:

```bash
docker compose down
```

To stop it and remove the saved database volume:

```bash
docker compose down -v
```

### 1. Create the database

Run the SQL file in [backend/src/database/schema.sql](/home/knightx/StudentProject/backend/src/database/schema.sql):

```bash
createdb -U postgres daily_habit_tracker
psql -U postgres -d daily_habit_tracker -f backend/src/database/schema.sql
```

That creates:

- Tables: `users`, `habits`

### 2. Create environment variables

Copy `backend/.env.example` to `backend/.env` and fill in your PostgreSQL credentials exactly as configured:

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env`:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=daily_habit_tracker
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-strong-secret
```

> Important: local authentication errors usually mean your PostgreSQL username, password, or database name do not match `.env`.


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

Install frontend dependencies and run Vite:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` for React app. The frontend uses `http://localhost:5000/api` by default through `VITE_API_BASE_URL`.


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
git commit -m "Create backend API and PostgreSQL integration"
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

For deployment on Render, create a managed PostgreSQL database and set:

- `DATABASE_URL`
- `CLIENT_URL`
- `JWT_SECRET`

If your provider requires TLS, also set:

- `DB_SSL=true`

Render Postgres typically provides a `postgresql://...` connection string directly.

After deploying the backend, update [frontend/config.js](/home/knightx/StudentProject/frontend/config.js) with the live backend URL.
