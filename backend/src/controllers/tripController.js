const db = require("../../database/init");
const logger = require("../utils/logger");

exports.getAll = (req, res, next) => {
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

exports.getById = (req, res, next) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid trip ID" });
    }

    db.get("SELECT * FROM trips WHERE id = ?", [id], (err, row) => {
        if (err) {
            logger.error("getById", err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        if (!row) {
            return res.status(404).json({ success: false, error: "Trip not found" });
        }
        res.json({ success: true, data: row });
    });
};

// ... other methods