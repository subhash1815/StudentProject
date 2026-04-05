const { Pool } = require("pg");

let pool;

function getSslConfig() {
  if (process.env.DB_SSL === "true") {
    return { rejectUnauthorized: false };
  }

  return undefined;
}

function getConnectionConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  const isProduction = process.env.NODE_ENV === "production";

  if (databaseUrl) {
    return {
      connectionString: databaseUrl,
      max: 10,
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
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "daily_habit_tracker",
    max: 10,
    ssl: getSslConfig(),
  };
}

async function initializeDatabase() {
  pool = new Pool(getConnectionConfig());

  await pool.query("SELECT 1");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      email VARCHAR(180) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create default fallback user for migrated habits.
  await pool.query(`
    INSERT INTO users (id, name, email, password_hash)
    VALUES (1, 'Default User', 'default@example.com', '')
    ON CONFLICT (id) DO NOTHING
  `);

  await pool.query(`
    SELECT setval(
      pg_get_serial_sequence('users', 'id'),
      GREATEST((SELECT COALESCE(MAX(id), 1) FROM users), 1)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS habits (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name VARCHAR(80) NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      streak INTEGER NOT NULL DEFAULT 0,
      last_completed_date TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // For legacy databases created before user_id was added to habits.
  await pool.query("ALTER TABLE habits ADD COLUMN IF NOT EXISTS user_id INTEGER");
  await pool.query("UPDATE habits SET user_id = 1 WHERE user_id IS NULL");
  await pool.query("ALTER TABLE habits ALTER COLUMN user_id SET DEFAULT 1");
  await pool.query("ALTER TABLE habits ALTER COLUMN user_id SET NOT NULL");

  // Ensure consistent foreign key exists in case the table existed with old schema.
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_habits_user'
      ) THEN
        ALTER TABLE habits
        ADD CONSTRAINT fk_habits_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      END IF;
    END
    $$;
  `);

  console.log("PostgreSQL connected successfully.");
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
