const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getDatabase } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRATION = "7d";

async function registerUser(request, response, next) {
  try {
    const { name, email, password } = request.body;
    if (!name || !email || !password) {
      return response.status(400).json({ message: "Name, email and password are required." });
    }

    const database = getDatabase();

    const [existing] = await database.query("SELECT id FROM users WHERE email = ?", [
      email.trim().toLowerCase(),
    ]);

    if (existing.length) {
      return response.status(409).json({ message: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [insertResult] = await database.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const token = jwt.sign({ userId: insertResult.insertId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    });

    response.status(201).json({
      id: insertResult.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      token,
    });
  } catch (error) {
    next(error);
  }
}

async function loginUser(request, response, next) {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(400).json({ message: "Email and password are required." });
    }

    const database = getDatabase();
    const [rows] = await database.query("SELECT id, name, email, password_hash FROM users WHERE email = ?", [
      email.trim().toLowerCase(),
    ]);

    if (rows.length === 0) {
      return response.status(401).json({ message: "Invalid credentials." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return response.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    });

    response.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    next(error);
  }
}

function getUserIdFromRequest(request) {
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

async function getProfile(request, response, next) {
  try {
    const userId = request.user?.userId || getUserIdFromRequest(request);
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized." });
    }

    const database = getDatabase();
    const [rows] = await database.query(
      "SELECT id, name, email, created_at AS createdAt FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return response.status(404).json({ message: "User not found." });
    }

    response.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deleteAccount(request, response, next) {
  try {
    const { password } = request.body;
    if (!password) {
      return response.status(400).json({ message: "Password is required to delete account." });
    }

    const userId = request.user?.userId || getUserIdFromRequest(request);
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized." });
    }

    const database = getDatabase();
    const [rows] = await database.query("SELECT password_hash FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return response.status(404).json({ message: "User not found." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return response.status(401).json({ message: "Invalid password." });
    }

    await database.query("DELETE FROM users WHERE id = ?", [userId]);

    response.json({ message: "Account deleted successfully." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  deleteAccount,
};