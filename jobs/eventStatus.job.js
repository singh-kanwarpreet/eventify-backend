const cron = require("node-cron");
const Event = require("../models/Event");

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const events = await Event.find({
      $or: [{ status: "UPCOMING" }, { status: "ONGOING" }],
    });

    for (const event of events) {
      if (event.startTime && event.endTime) {
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);

        if (now >= startTime && now <= endTime) {
          await Event.findByIdAndUpdate(event._id, { status: "ONGOING" });
        } else if (now < startTime) {
          await Event.findByIdAndUpdate(event._id, { status: "UPCOMING" });
        } else if (now > endTime) {
          await Event.findByIdAndUpdate(event._id, { status: "COMPLETED" });
        }
      }
    }
  } catch (error) {
    console.error("Error updating event statuses:", error);
  }
});
