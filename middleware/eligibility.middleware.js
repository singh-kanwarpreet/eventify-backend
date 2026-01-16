const eventModel = require("../models/Event");
const registrationModel = require("../models/Registration");
const ageCalculator = require("../utils/ageCalculator");

async function eligibilityRules(req, res, next) {
  try {
    const { eventId } = req.params;
    const user = req.user;

    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!user?.dateOfBirth) {
      return res.status(400).json({ message: "DOB missing" });
    }
    if (event.status !== "UPCOMING") {
      return res.status(400).json({
        message: "Registration is closed for this event",
      });
    }

    const age = ageCalculator(user.dateOfBirth);
    const { minAge, maxAge } = event.eligibilityRules;

    if (age < minAge || age > maxAge) {
      return res.status(400).json({ message: "Age not eligible" });
    }

    if (new Date() > event.dateTime) {
      return res.status(400).json({ message: "Event expired" });
    }

    const alreadyRegistered = await registrationModel.findOne({
      userId: user._id,
      eventId,
    });

    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = eligibilityRules;
