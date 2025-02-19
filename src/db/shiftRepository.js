// db/shiftRepository.js
require('dotenv').config();
const { Pool } = require("pg");
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Use Render's database URL
    ssl: { rejectUnauthorized: false }, // Required for Render's hosted Postgres
});

class ShiftRepository {
  constructor() {
    this.db = new Database('shifts.db');
    this.initialize();
  }

  initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS shifts (
        id INTEGER PRIMARY KEY,
        employee TEXT,
        start_datetime TEXT,
        end_datetime TEXT,
        UNIQUE(employee, start_datetime)
      )
    `);
  }

  saveShifts(shifts) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO shifts 
      (employee, start_datetime, end_datetime)
      VALUES (?, ?, ?)
    `);

    this.db.transaction(() => {
      shifts.forEach(shift => {
        // Combine the date and time strings directly.
        const start = `${shift.date} ${shift.startTime}`;
        const end = `${shift.date} ${shift.endTime}`;
        stmt.run(shift.employee, start, end);
      });
    })();
  }

  getShiftsByName(name) {
    return this.db
      .prepare(`
        SELECT * FROM shifts 
        WHERE employee COLLATE NOCASE = ?
        ORDER BY start_datetime
      `)
      .all(name);
  }
}

module.exports = new ShiftRepository;
