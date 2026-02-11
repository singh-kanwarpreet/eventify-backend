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
    const events = await Event.find({
      status: { $ne: "ARCHIVED" },
    });
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

const eventGetById = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await Event.findById(eventId);
    const isRegistered = await registerationModel.exists({
      userId: req.user._id,
      eventId: eventId,
    });
    const eventObj = event.toObject();
    if (isRegistered) {
      eventObj.isRegistered = true;
    } else {
      eventObj.isRegistered = false;
    }
    if (event) {
      return res.status(200).json({ event: eventObj });
    } else {
      return res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const eventGetUserRegistrations = async (req, res) => {
  try {
    const registrations = await registerationModel
      .find({
        userId: req.user._id,
      })
      .populate("eventId");
    res.status(200).json({ registrations });
  } catch (error) {
    console.error("Error fetching user registrations:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const eventGetEventRegistrations = async (req, res) => {
  const { eventId } = req.params;
  try {
    const { _id } = req.user;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.organizerId.toString() !== _id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const registrations = await registerationModel
      .find({
        eventId,
      })
      .populate("userId", "name email");
    res.status(200).json({ registrations });
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const markAttendanceBulk = async (req, res) => {
  const { eventId } = req.params;
  const { attendance } = req.body;
  try {
    const { _id } = req.user;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.organizerId.toString() !== _id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const bulkOps = attendance.map((entry) => ({
      updateOne: {
        filter: { _id: entry.id, eventId },
        update: { attended: entry.attended },
      },
    }));

    await registerationModel.bulkWrite(bulkOps);
    res.status(200).json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  eventCreate,
  eventGetAll,
  eventUserRegister,
  eventDeletion,
  eventGetById,
  eventGetUserRegistrations,
  eventGetEventRegistrations,
  markAttendanceBulk,
};
