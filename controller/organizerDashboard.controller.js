const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Organizer = require("../models/Organizer");
const { deleteFromCloudStorage } = require("../services/cloudStorage.service");


const getOrganizerDashboard = async (req, res) => {
  try {
    const organizerId = req.user._id;

    // Total events
    const events = await Event.find({ organizerId });
    const totalEvents = events.length;

    // Total registrations
    const eventIds = events.map((e) => e._id);
    const totalRegistrations = await Registration.countDocuments({
      eventId: { $in: eventIds },
    });

    const avgRating = await Organizer.findOne({managedBy: organizerId}).select("averageRating");
    res.status(200).json({
      stats: {
        totalEvents,
        totalRegistrations,
        avgRating: avgRating ? avgRating.averageRating.toFixed(1) : 0,
      },
      events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await Registration.find({ eventId })
      .populate("userId", "name email phone")
      .sort({ registeredAt: -1 });

    res.status(200).json({ registrations });
  } catch (error) {
    console.error(error);
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

    await Registration.bulkWrite(bulkOps);
    res.status(200).json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const archieveEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    if(event.status !== "COMPLETED"){
      return res.status(400).json({ message: "Only completed events can be archived" });
    }
    const result = await Event.findByIdAndUpdate(eventId, { status: "ARCHIVED" }, { new: true });
    if (result) {
      return res.status(200).json({ message: "Event archived successfully", event: result });
    }
  } catch (error) {
    console.error("Error archiving event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const unarchieveEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    if(event.status !== "ARCHIVED"){
      return res.status(400).json({ message: "Only archived events can be unarchived" });
    }
    const result = await Event.findByIdAndUpdate(eventId, { status: "COMPLETED" }, { new: true });
    if (result) {
      return res.status(200).json({ message: "Event unarchived successfully", event: result });
    }
  } catch (error) {
    console.error("Error unarchiving event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getEventRegistrations, getOrganizerDashboard, eventDeletion, markAttendanceBulk, archieveEvent, unarchieveEvent };

