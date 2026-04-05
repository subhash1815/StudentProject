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

### Option A: Run MySQL with Docker

Use Docker Compose from the project root:

```bash
docker compose up -d
```

This pulls the official `mysql:8.4` image, starts a local database on `127.0.0.1:3306`, and initializes the schema automatically from [backend/src/database/schema.sql](/home/knightx/StudentProject/backend/src/database/schema.sql).

The default container credentials match [backend/.env.example](/home/knightx/StudentProject/backend/.env.example):

- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_USER=student`
- `DB_PASSWORD=1234`
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
mysql -u root -p < backend/src/database/schema.sql
```

That creates:

- Database: `daily_habit_tracker`
- Table: `habits`

### 2. Create environment variables

Copy `backend/.env.example` to `backend/.env` and fill in your MySQL credentials exactly as configured:

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env`:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_ROOT_PASSWORD_HERE
DB_NAME=daily_habit_tracker
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-strong-secret
```

If root has no password on your machine, set `DB_PASSWORD=` (empty). If there is a password, set it accordingly.

> Important: `Failed to start server: Access denied for user 'root'@'localhost'` means MySQL auth is not matching `.env`.


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

For deployment, use a hosted MySQL provider or Render/Railway MySQL-compatible database.

Set either a full connection string:

- `DATABASE_URL`

Or set the individual variables:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

If your provider requires TLS, also set:

- `DB_SSL=true`

Also set:

- `CLIENT_URL`

Important: do not leave `DB_HOST=127.0.0.1` in Render unless MySQL is running in the same container, which it is not. A Render web service cannot connect to your laptop's local MySQL server.

After deploying the backend, update [frontend/config.js](/home/knightx/StudentProject/frontend/config.js) with the live backend URL.
