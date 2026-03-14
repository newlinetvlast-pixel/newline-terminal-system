const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const db = require("../database/init");

const app = express();
const PORT = process.env.PORT || 3000;

// ============ MIDDLEWARE ============
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// ============ HEALTH CHECK ============
app.get("/health", (req, res) => {
    res.json({ 
        status: "✅ Server running", 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV 
    });
});

// ============ GET ALL TRIPS ============
app.get("/api/trips", (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const offset = parseInt(req.query.offset) || 0;

    db.all(
        "SELECT * FROM trips ORDER BY id DESC LIMIT ? OFFSET ?",
        [limit, offset],
        (err, rows) => {
            if (err) {
                console.error("❌ Database error:", err);
                return res.status(500).json({ success: false, error: "Database error" });
            }
            res.json({ success: true, data: rows || [] });
        }
    );
});

// ============ GET TRIP BY ID ============
app.get("/api/trips/:id", (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid trip ID" });
    }

    db.get("SELECT * FROM trips WHERE id = ?", [id], (err, row) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        if (!row) {
            return res.status(404).json({ success: false, error: "Trip not found" });
        }
        res.json({ success: true, data: row });
    });
});

// ============ CREATE TRIP ============
app.post("/api/trips", (req, res) => {
    const { passenger, passport, driver, destination, type, fare } = req.body;

    // Validation
    const errors = [];
    if (!passenger || typeof passenger !== "string" || passenger.trim().length < 2) {
        errors.push("Passenger name required (min 2 chars)");
    }
    if (!passport || typeof passport !== "string" || passport.trim().length < 3) {
        errors.push("Valid passport required");
    }
    if (!driver || typeof driver !== "string" || driver.trim().length < 2) {
        errors.push("Driver name required (min 2 chars)");
    }
    if (!destination || typeof destination !== "string" || destination.trim().length < 2) {
        errors.push("Destination required (min 2 chars)");
    }
    if (!fare || isNaN(parseFloat(fare)) || parseFloat(fare) <= 0) {
        errors.push("Valid fare required (> 0)");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    const date = new Date().toISOString();
    const tripType = type || "Local";

    db.run(
        "INSERT INTO trips (passenger, passport, driver, destination, type, fare, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [passenger.trim(), passport.trim(), driver.trim(), destination.trim(), tripType, parseFloat(fare), date],
        function (err) {
            if (err) {
                console.error("❌ Database error:", err);
                return res.status(500).json({ success: false, error: "Failed to create trip" });
            }
            res.status(201).json({
                success: true,
                data: {
                    id: this.lastID,
                    passenger: passenger.trim(),
                    passport: passport.trim(),
                    driver: driver.trim(),
                    destination: destination.trim(),
                    type: tripType,
                    fare: parseFloat(fare),
                    date
                }
            });
        }
    );
});

// ============ UPDATE TRIP ============
app.put("/api/trips/:id", (req, res) => {
    const { id } = req.params;
    const { passenger, passport, driver, destination, type, fare } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid trip ID" });
    }

    db.run(
        "UPDATE trips SET passenger = ?, passport = ?, driver = ?, destination = ?, type = ?, fare = ? WHERE id = ?",
        [
            passenger?.trim() || null,
            passport?.trim() || null,
            driver?.trim() || null,
            destination?.trim() || null,
            type || null,
            fare ? parseFloat(fare) : null,
            id
        ],
        function (err) {
            if (err) {
                console.error("❌ Database error:", err);
                return res.status(500).json({ success: false, error: "Failed to update trip" });
            }
            if (this.changes === 0) {
                return res.status(404).json({ success: false, error: "Trip not found" });
            }
            res.json({ success: true, message: "Trip updated successfully" });
        }
    );
});

// ============ DELETE TRIP ============
app.delete("/api/trips/:id", (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid trip ID" });
    }

    db.run("DELETE FROM trips WHERE id = ?", [id], function (err) {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ success: false, error: "Failed to delete trip" });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, error: "Trip not found" });
        }
        res.json({ success: true, message: "Trip deleted successfully" });
    });
});

// ============ SEARCH TRIPS ============
app.get("/api/search", (req, res) => {
    const q = req.query.q || "";

    if (!q || q.length < 1) {
        return res.json({ success: true, data: [] });
    }

    if (q.length > 100) {
        return res.status(400).json({ success: false, error: "Search query too long" });
    }

    db.all(
        "SELECT * FROM trips WHERE passenger LIKE ? OR driver LIKE ? OR destination LIKE ? OR passport LIKE ? ORDER BY id DESC LIMIT 100",
        [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`],
        (err, rows) => {
            if (err) {
                console.error("❌ Database error:", err);
                return res.status(500).json({ success: false, error: "Database error" });
            }
            res.json({ success: true, data: rows || [] });
        }
    );
});

// ============ STATISTICS ============
app.get("/api/stats", (req, res) => {
    db.get(
        "SELECT COUNT(*) as trips, SUM(fare) as earnings, AVG(fare) as average FROM trips",
        [],
        (err, row) => {
            if (err) {
                console.error("❌ Database error:", err);
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
});

app.get("/api/stats/daily", (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    db.get(
        "SELECT COUNT(*) as trips, SUM(fare) as earnings FROM trips WHERE DATE(date) = ?",
        [today],
        (err, row) => {
            if (err) {
                console.error("❌ Database error:", err);
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
});

// ============ EXPORT CSV ============
app.get("/api/export/csv", (req, res) => {
    db.all("SELECT * FROM trips ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ success: false, error: "Database error" });
        }

        if (!rows || rows.length === 0) {
            return res.status(400).json({ success: false, error: "No data to export" });
        }

        const headers = Object.keys(rows[0]);
        const csvContent = [
            headers.join(","),
            ...rows.map(row =>
                headers.map(h => {
                    const val = row[h];
                    return typeof val === "string" && val.includes(",") ? `"${val}"` : val;
                }).join(",")
            )
        ].join("\n");

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename=trips-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csvContent);
    });
});

// ============ 404 HANDLER ============
app.use((req, res) => {
    res.status(404).json({ success: false, error: "Endpoint not found" });
});

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
    console.error("❌ Unhandled error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
});

module.exports = app;