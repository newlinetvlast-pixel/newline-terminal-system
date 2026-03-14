const express = require("express");
const router = express.Router();
const db = require("../../database/init");
const { validateTrip } = require("../middleware/validation");
const logger = require("../utils/logger");

// GET all trips
router.get("/", (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const offset = parseInt(req.query.offset) || 0;

    db.all(
        "SELECT * FROM trips ORDER BY id DESC LIMIT ? OFFSET ?",
        [limit, offset],
        (err, rows) => {
            if (err) {
                logger.error("GET /trips", err);
                return res.status(500).json({ success: false, error: "Database error" });
            }
            res.json({ success: true, data: rows || [] });
        }
    );
});

// GET trip by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid trip ID" });
    }

    db.get("SELECT * FROM trips WHERE id = ?", [id], (err, row) => {
        if (err) {
            logger.error("GET /trips/:id", err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        if (!row) {
            return res.status(404).json({ success: false, error: "Trip not found" });
        }
        res.json({ success: true, data: row });
    });
});

// CREATE trip
router.post("/", validateTrip, (req, res) => {
    const { passenger, passport, driver, destination, type, fare } = req.body;
    const date = new Date().toISOString();

    db.run(
        "INSERT INTO trips (passenger, passport, driver, destination, type, fare, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [passenger.trim(), passport.trim(), driver.trim(), destination.trim(), type || "Local", parseFloat(fare), date],
        function (err) {
            if (err) {
                logger.error("POST /trips", err);
                return res.status(500).json({ success: false, error: "Failed to create trip" });
            }
            logger.info(`Trip created: ${passenger} → ${destination}`);
            res.status(201).json({
                success: true,
                data: {
                    id: this.lastID,
                    passenger: passenger.trim(),
                    passport: passport.trim(),
                    driver: driver.trim(),
                    destination: destination.trim(),
                    type: type || "Local",
                    fare: parseFloat(fare),
                    date
                }
            });
        }
    );
});

// UPDATE trip
router.put("/:id", validateTrip, (req, res) => {
    const { id } = req.params;
    const { passenger, passport, driver, destination, type, fare } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid trip ID" });
    }

    db.run(
        "UPDATE trips SET passenger = ?, passport = ?, driver = ?, destination = ?, type = ?, fare = ? WHERE id = ?",
        [passenger.trim(), passport.trim(), driver.trim(), destination.trim(), type, parseFloat(fare), id],
        function (err) {
            if (err) {
                logger.error("PUT /trips/:id", err);
                return res.status(500).json({ success: false, error: "Failed to update trip" });
            }
            if (this.changes === 0) {
                return res.status(404).json({ success: false, error: "Trip not found" });
            }
            logger.info(`Trip updated: ID ${id}`);
            res.json({ success: true, message: "Trip updated successfully" });
        }
    );
});

// DELETE trip
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid trip ID" });
    }

    db.run("DELETE FROM trips WHERE id = ?", [id], function (err) {
        if (err) {
            logger.error("DELETE /trips/:id", err);
            return res.status(500).json({ success: false, error: "Failed to delete trip" });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, error: "Trip not found" });
        }
        logger.info(`Trip deleted: ID ${id}`);
        res.json({ success: true, message: "Trip deleted successfully" });
    });
});

module.exports = router;