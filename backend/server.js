const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { initializeDatabase } = require("./src/config/db");
const habitRoutes = require("./src/routes/habitRoutes");
const authRoutes = require("./src/routes/authRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "null",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow browser requests from Live Server, localhost variants, and file:// during local learning.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    message: "Daily Habit Tracker API is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);

app.use((error, request, response, next) => {
  response.status(error.statusCode || 500).json({
    message: error.message || "Internal server error.",
  });
});

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
