const mysql = require("mysql2/promise");

let pool;

async function initializeDatabase() {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS habits (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      streak INT NOT NULL DEFAULT 0,
      last_completed_date DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

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
