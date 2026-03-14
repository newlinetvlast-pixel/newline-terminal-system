const validateTrip = (req, res, next) => {
    const { passenger, passport, driver, destination, fare } = req.body;
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

    next();
};

module.exports = { validateTrip };