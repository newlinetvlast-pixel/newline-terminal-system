const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/login", (req, res) => {
    const { email, password } = req.body;
    
    // TODO: Check against database
    if (email === "admin@terminal.com" && password === "password123") {
        const token = jwt.sign(
            { email, role: "admin" },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "24h" }
        );
        return res.json({ success: true, token });
    }
    
    res.status(401).json({ success: false, error: "Invalid credentials" });
});

module.exports = router;