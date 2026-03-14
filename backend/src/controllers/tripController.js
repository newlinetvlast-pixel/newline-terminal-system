const db = require("../../database/init");
const logger = require("../utils/logger");

// GET ALL TRIPS
exports.getAll = (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const offset = parseInt(req.query.offset) || 0;

    db.all(
        "SELECT * FROM trips ORDER BY id DESC LIMIT ? OFFSET ?",
        [limit, offset],
        (err, rows) => {
            if (err) {
                logger.error("getAll", err);
                return res.status(500).json({ success: false, error: "Database error" });
            }
            res.json({ success: true, data: rows || [] });
        }
    );
};

// GET TRIP BY ID
exports.getById = (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid ID" });

    db.get("SELECT * FROM trips WHERE id = ?", [id], (err, row) => {
        if (err) {
            logger.error("getById", err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        if (!row) return res.status(404).json({ success: false, error: "Not found" });
        res.json({ success: true, data: row });
    });
};

// CREATE TRIP
exports.create = (req, res) => {
    const { passenger, passport, driver, destination, type, fare } = req.body;
    const date = new Date().toISOString();

    db.run(
        "INSERT INTO trips (passenger, passport, driver, destination, type, fare, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [passenger.trim(), passport.trim(), driver.trim(), destination.trim(), type || "Local", parseFloat(fare), date],
        function (err) {
            if (err) {
                logger.error("create", err);
                return res.status(500).json({ success: false, error: "Failed to create" });
            }
            logger.info(`Trip created: ${passenger}`);
            res.status(201).json({ success: true, data: { id: this.lastID } });
        }
    );
};

// UPDATE TRIP
exports.update = (req, res) => {
    const { id } = req.params;
    const { passenger, passport, driver, destination, type, fare } = req.body;
    if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid ID" });

    db.run(
        "UPDATE trips SET passenger = ?, passport = ?, driver = ?, destination = ?, type = ?, fare = ? WHERE id = ?",
        [passenger.trim(), passport.trim(), driver.trim(), destination.trim(), type, parseFloat(fare), id],
        function (err) {
            if (err) {
                logger.error("update", err);
                return res.status(500).json({ success: false, error: "Failed to update" });
            }
            if (this.changes === 0) return res.status(404).json({ success: false, error: "Not found" });
            logger.info(`Trip updated: ID ${id}`);
            res.json({ success: true, message: "Updated" });
        }
    );
};

// DELETE TRIP
exports.delete = (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid ID" });

    db.run("DELETE FROM trips WHERE id = ?", [id], function (err) {
        if (err) {
            logger.error("delete", err);
            return res.status(500).json({ success: false, error: "Failed to delete" });
        }
        if (this.changes === 0) return res.status(404).json({ success: false, error: "Not found" });
        logger.info(`Trip deleted: ID ${id}`);
        res.json({ success: true, message: "Deleted" });
    });
};

// SEARCH TRIPS
exports.search = (req, res) => {
    const q = req.query.q || "";
    if (!q) return res.json({ success: true, data: [] });

    db.all(
        "SELECT * FROM trips WHERE passenger LIKE ? OR driver LIKE ? OR destination LIKE ? ORDER BY id DESC LIMIT 100",
        [`%${q}%`, `%${q}%`, `%${q}%`],
        (err, rows) => {
            if (err) {
                logger.error("search", err);
                return res.status(500).json({ success: false, error: "Database error" });
            }
            res.json({ success: true, data: rows || [] });
        }
    );
};

// GET STATISTICS
exports.stats = (req, res) => {
    db.get(
        "SELECT COUNT(*) as trips, SUM(fare) as earnings, AVG(fare) as average FROM trips",
        [],
        (err, row) => {
            if (err) {
                logger.error("stats", err);
                return res.status(500).json({ success: false, error: "Database error" });
            }
            res.json({
                success: true,
                data: {
                    trips: row?.trips || 0,
                    earnings: row?.earnings || 0,
                    average: row?.average || 0
                }
            });
        }
    );
};

// DAILY STATISTICS
exports.dailyStats = (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    db.get(
        "SELECT COUNT(*) as trips, SUM(fare) as earnings FROM trips WHERE DATE(date) = ?",
        [today],
        (err, row) => {
            if (err) {
                logger.error("dailyStats", err);
                return res.status(500).json({ success: false, error: "Database error" });
            }
            res.json({
                success: true,
                data: {
                    trips: row?.trips || 0,
                    earnings: row?.earnings || 0
                }
            });
        }
    );
};

// EXPORT CSV
exports.exportCSV = (req, res) => {
    db.all("SELECT * FROM trips ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            logger.error("exportCSV", err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        if (!rows || rows.length === 0) {
            return res.status(400).json({ success: false, error: "No data" });
        }

        const headers = Object.keys(rows[0]);
        const csv = [
            headers.join(","),
            ...rows.map(r => headers.map(h => r[h]).join(","))
        ].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=trips.csv");
        res.send(csv);
    });
};