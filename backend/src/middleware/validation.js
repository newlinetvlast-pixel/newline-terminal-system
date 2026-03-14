const validateTrip = (req, res, next) => {
    const { passenger, passport, driver, destination, fare } = req.body;
    const errors = [];

    if (!passenger || typeof passenger !== "string" || passenger.trim().length < 2) {
        errors.push("Passenger name required (min 2 chars)");
    }
    if (passenger && passenger.length > 50) {
        errors.push("Passenger name too long (max 50)");
    }

    if (!passport || typeof passport !== "string" || passport.trim().length < 3) {
        errors.push("Valid passport required (min 3 chars)");
    }
    if (passport && passport.length > 20) {
        errors.push("Passport too long (max 20)");
    }

    if (!driver || typeof driver !== "string" || driver.trim().length < 2) {
        errors.push("Driver name required (min 2 chars)");
    }

    if (!destination || typeof destination !== "string" || destination.trim().length < 2) {
        errors.push("Destination required (min 2 chars)");
    }
    if (destination && destination.length > 100) {
        errors.push("Destination too long (max 100)");
    }

    if (!fare || isNaN(parseFloat(fare)) || parseFloat(fare) <= 0) {
        errors.push("Valid fare required (> 0)");
    }
    if (fare && parseFloat(fare) > 999999) {
        errors.push("Fare too high");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
};

module.exports = { validateTrip };