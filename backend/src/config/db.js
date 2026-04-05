const mysql = require("mysql2/promise");

let pool;

function getSslConfig() {
  if (process.env.DB_SSL === "true") {
    return { rejectUnauthorized: false };
  }

  return undefined;
}

function getConnectionConfig() {
  const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  const isProduction = process.env.NODE_ENV === "production";

  if (databaseUrl) {
    const parsedUrl = new URL(databaseUrl);

    return {
      host: parsedUrl.hostname,
      port: Number(parsedUrl.port || 3306),
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      database: parsedUrl.pathname.replace(/^\//, ""),
      waitForConnections: true,
      connectionLimit: 10,
      ssl: getSslConfig(),
    };
  }

  const requiredKeys = ["DB_HOST", "DB_PORT", "DB_USER", "DB_NAME"];
  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  if (isProduction && missingKeys.length > 0) {
    throw new Error(
      `Missing database environment variables in production: ${missingKeys.join(", ")}`
    );
  }

  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "daily_habit_tracker",
    waitForConnections: true,
    connectionLimit: 10,
    ssl: getSslConfig(),
  };
}

async function initializeDatabase() {
  pool = mysql.createPool(getConnectionConfig());

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      email VARCHAR(180) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create default fallback user for migrated habits.
  await pool.query(`
    INSERT INTO users (id, name, email, password_hash)
    SELECT 1, 'Default User', 'default@example.com', ''
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS habits (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(80) NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      streak INT NOT NULL DEFAULT 0,
      last_completed_date DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // For legacy databases created before user_id was added to habits.
  const [columns] = await pool.query("SHOW COLUMNS FROM habits LIKE 'user_id'");
  if (columns.length === 0) {
    await pool.query("ALTER TABLE habits ADD COLUMN user_id INT NULL");
  }

  await pool.query("UPDATE habits SET user_id = 1 WHERE user_id IS NULL");
  await pool.query("ALTER TABLE habits MODIFY COLUMN user_id INT NOT NULL DEFAULT 1");

  // Ensure consistent foreign key exists in case the table existed with old schema.
  await pool.query(`
    ALTER TABLE habits
    ADD CONSTRAINT fk_habits_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  `).catch(() => {
    // ignore if constraint already exists or cannot be added because it exists under another name
  });

  console.log("MySQL connected successfully.");
}

function getDatabase() {
  if (!pool) {
    throw new Error("Database has not been initialized yet.");
  }

  return pool;
}

module.exports = {
  initializeDatabase,
  getDatabase,
};
