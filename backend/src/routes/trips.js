const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const { validateTrip } = require("../middleware/validation");

router.get("/", tripController.getAll);
router.get("/:id", tripController.getById);
router.post("/", validateTrip, tripController.create);
router.put("/:id", validateTrip, tripController.update);
router.delete("/:id", tripController.delete);
router.get("/search", tripController.search);

module.exports = router;