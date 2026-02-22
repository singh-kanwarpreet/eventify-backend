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
    if(startTimeUTC >= endTimeUTC) {
      return res.status(400).json({
        message: "Event end time must be after start time.",
      });
    }
  
    if(new Date(startTimeUTC) <= new Date()) {
      return res.status(400).json({
        message: "Event start time must be after current time.",
      });
    }
    
    const event = await Event.create({
      title,
      description,
      startTime: startTimeUTC,
      endTime: endTimeUTC,
      location,
      mode,
      capacity,
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
    let { page = 1, limit = 6 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const totalEvents = await Event.countDocuments({
      status: { $nin: ["ARCHIVED", "COMPLETED"] },
    });

    const events = await Event.find({
      status: { $nin: ["ARCHIVED", "COMPLETED"] },
    })
      .sort({ startTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      events,
      pagination: {
        total: totalEvents,
        page,
        limit,
        totalPages: Math.ceil(totalEvents / limit),
      },
    });
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

// eventGetUserRegistrations
const eventGetUserRegistrations = async (req, res) => {
  try {
    let { page = 1, limit = 6, status } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = { userId: req.user._id };
    if (status) filter["eventId.status"] = status;

    const totalRegistrations = await registerationModel.countDocuments(filter);

    const registrations = await registerationModel
      .find({ userId: req.user._id })
      .populate({
        path: "eventId",
        match: status ? { status } : {},
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
      
      const filtered = registrations.filter(r => r.eventId);

      res.status(200).json({
      registrations: filtered,
      pagination: {
        total: totalRegistrations,
        page,
        limit,
        totalPages: Math.ceil(totalRegistrations / limit),
      },
    });
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


module.exports = {
  eventCreate,
  eventGetAll,
  eventUserRegister,
  eventGetById,
  eventGetUserRegistrations,
  eventGetEventRegistrations,
};
