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

