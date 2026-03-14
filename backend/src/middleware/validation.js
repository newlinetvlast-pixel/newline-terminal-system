// Current validation in backend/src/middleware/validation.js
const validateTrip = (req, res, next) => {
    const { passenger, passport, driver, destination, fare } = req.body;
    const errors = [];

    // ✅ PROPER VALIDATION
    if (!passenger || typeof passenger !== "string" || passenger.trim().length < 2) {
        errors.push("Passenger name required (min 2 chars)");
    }
    if (!passport || typeof passport !== "string" || passport.trim().length < 3) {
        errors.push("Valid passport required");
    }
    // ... rest of validation

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    next();
};