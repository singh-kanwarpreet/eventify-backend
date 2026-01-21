const Event = require("../models/Event");
const registerationModel = require("../models/Registration");
const {
  deleteFromCloudStorage,
  uploadToCloudStorage,
} = require("../services/cloudStorage.service");

const eventCreate = async (req, res) => {
  let imageData = null;

  try {
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      mode,
      capacity,
      eligibilityRules,
    } = req.body;
    const startTimeUTC = new Date(startTime).toISOString();
    const endTimeUTC = new Date(endTime).toISOString();
    const existingEvent = await Event.findOne({
      organizerId: req.user._id,
      title: title,
    });
    if (existingEvent) {
      return res.status(400).json({
        message: "You have already created an event with this title.",
      });
    }
    if (req.file) {
      imageData = await uploadToCloudStorage(req.file);
    }
    const event = await Event.create({
      title,
      description,
      startTime: startTimeUTC,
      endTime: endTimeUTC,
      location,
      mode,
      capacity,
      status: "UPCOMING",
      organizerId: req.user._id,
      eligibilityRules: eligibilityRules || { minAge: 0, maxAge: 100 },
      ...(imageData && { image: imageData }),
    });

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const eventGetAll = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const eventUserRegister = async (req, res) => {
  const { eventId } = req.params;
  try {
    const registeration = await registerationModel.create({
      userId: req.user._id,
      eventId,
    });
    res.status(201).json({
      message: "Registration successful",
      registeration,
    });
    const event = await Event.findById(eventId);
    if (event) {
      event.availableSeats -= 1;
      await event.save();
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const eventDeletion = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const result = await Event.findByIdAndDelete(eventId);
    if (result) {
      if (result.image && result.image.publicId) {
        await deleteFromCloudStorage(result.image.publicId);
      }
      return res.status(201).json({ message: "Event deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { eventCreate, eventGetAll, eventUserRegister, eventDeletion };
