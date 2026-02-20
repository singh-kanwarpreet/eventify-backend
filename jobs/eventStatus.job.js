const cron = require("node-cron");

const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Organizer = require("../models/Organizer");

const { sendEmail } = require("../services/email.service");
const generateCertificate = require("../utils/generateCertificate");
const reminderTemplate = require("../utils/reminderTemplate");

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    // Fetching upcoming/ongoing events and organizer user

    const events = await Event.find({
      status: { $in: ["UPCOMING", "ONGOING"] },
    }).populate("organizerId", "name email");

    if (!events.length) return;

    const userIds = events.map((e) => e.organizerId._id);

    const organizers = await Organizer.find({
      managedBy: { $in: userIds },
    }).select("organizationName managedBy");

    // Map: userId → organizationName
    const organizerMap = {};
    organizers.forEach((org) => {
      organizerMap[org.managedBy.toString()] = org.organizationName;
    });

    // Process each event

    for (const event of events) {
      const startTime = new Date(event.startTime);
      const endTime = new Date(event.endTime);

      const organizationName =
        organizerMap[event.organizerId._id.toString()] || "Organizer";

      // STATUS UPDATE

      if (now >= startTime && now <= endTime && event.status !== "ONGOING") {
        event.status = "ONGOING";
        await event.save();
      }

      // send certificates and mark event as completed
      else if (now > endTime && event.status !== "COMPLETED") {
        event.status = "COMPLETED";
        await event.save();

        const attendees = await Registration.find({
          eventId: event._id,
          attended: true,
          certificateSent: false,
        }).populate("userId", "name email");

        if (attendees.length) {
          await Promise.all(
            attendees.map(async (reg) => {
              const pdfBuffer = await generateCertificate(
                reg.userId.name,
                event.title,
                endTime.toDateString(),
                organizationName,
              );

              await sendEmail({
                to: reg.userId.email,
                subject: `Your Certificate for ${event.title}`,
                text: "Thanks for participating!",
                attachments: [
                  {
                    filename: "certificate.pdf",
                    content: pdfBuffer,
                  },
                ],
              });
            }),
          );

          // batch update
          await Registration.updateMany(
            { _id: { $in: attendees.map((a) => a._id) } },
            { $set: { certificateSent: true } },
          );
        }
      }

      // reminder emails for events starting in the next hour
      
      const diffMinutes = (startTime - now) / 1000 / 60;
console.log("Server Time:", now);
      console.log("Event Time:", startTime);
      console.log("Diff Minutes:", diffMinutes);
      if (diffMinutes <= 60 && diffMinutes >= 0) {
        const registrations = await Registration.find({
          eventId: event._id,
          reminderSent: false,
        }).populate("userId", "name email");

        if (registrations.length) {
          await Promise.all(
            registrations.map(async (reg) => {
              await sendEmail({
                to: reg.userId.email,
                subject: `Reminder: "${event.title}" starts soon!`,
                text: `Your event starts soon`,
                html: reminderTemplate({
                  name: reg.userId.name,
                  title: event.title,
                  startTime: startTime.toLocaleString(),
                  endTime: endTime.toLocaleString(),
                  location: event.location,
                  mode: event.mode,
                  imageUrl: event.image?.url,
                  availableSeats: event.availableSeats,
                }),
              });
            }),
          );

          // batch update
          await Registration.updateMany(
            { _id: { $in: registrations.map((r) => r._id) } },
            { $set: { reminderSent: true } },
          );
        }
      }
    }
  } catch (err) {
    console.error("Event cron job error:", err);
  }
});
