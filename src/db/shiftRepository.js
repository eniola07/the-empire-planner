require('dotenv').config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use Render's database URL
  ssl: { rejectUnauthorized: false }, // Required for Render's hosted Postgres
});

function convertDateFormat(dateStr) {
  // Input format: "dd/MM/yyyy"
  // Output format: "yyyy-MM-dd"
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
}

class ShiftRepository {
  async initialize() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shifts (
        id SERIAL PRIMARY KEY,
        employee TEXT NOT NULL,
        start_datetime TIMESTAMP NOT NULL,
        end_datetime TIMESTAMP NOT NULL,
        UNIQUE(employee, start_datetime)
      );
    `);
  }
  

  async saveShifts(shifts) {
    const query = `
      INSERT INTO shifts (employee, start_datetime, end_datetime)
      VALUES ($1, $2, $3)
      ON CONFLICT (employee, start_datetime) DO UPDATE SET
        end_datetime = EXCLUDED.end_datetime;
    `;
    for (const shift of shifts) {
      const formattedDate = convertDateFormat(shift.date);
      // Combine the formatted date with the time strings
      const start = `${formattedDate} ${shift.startTime}`;
      const end = `${formattedDate} ${shift.endTime}`;
      await pool.query(query, [shift.employee, start, end]);
    }
  }
  

  async getShiftsByName(name) {
    const result = await pool.query(
      "SELECT * FROM shifts WHERE LOWER(employee) = LOWER($1) ORDER BY start_datetime",
      [name]
    );
    return result.rows;
  }
}

module.exports = new ShiftRepository();
