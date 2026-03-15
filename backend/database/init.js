const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db_name = path.join(__dirname, "terminal.db");
const db = new sqlite3.Database(db_name, (err) => {
    if (err) {
        console.error("DB Error:", err.message);
        process.exit(1);
    } else {
        console.log("✅ Database connected!");
    }
});

const sql_create = `CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passenger TEXT NOT NULL,
    passport TEXT NOT NULL,
    driver TEXT NOT NULL,
    destination TEXT NOT NULL,
    type TEXT DEFAULT 'Local',
    fare REAL NOT NULL,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);`;

db.run(sql_create, (err) => {
    if (err) {
        console.error("Table error:", err.message);
    } else {
        console.log("✅ Trips table created!");
        db.run("CREATE INDEX IF NOT EXISTS idx_passenger ON trips(passenger);");
        db.run("CREATE INDEX IF NOT EXISTS idx_date ON trips(date);");
        db.run("CREATE INDEX IF NOT EXISTS idx_driver ON trips(driver);");
        db.run("CREATE INDEX IF NOT EXISTS idx_destination ON trips(destination);");
        console.log("✅ Indexes created!");
    }
});

module.exports = db;