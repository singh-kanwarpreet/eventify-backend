const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    image: {
      url: {
        type: String,
        default:
          "https://media.istockphoto.cohttps://media.istockphoto.com/id/1218975473/photo/group-of-college-student-friends-meeting-and-talking-in-busy-communal-campus-building.jpg?s=612x612&w=0&k=20&c=ggYncioFDbZjXryC923y3Jmdc3uNFAsmZML-ftZYXYI=m/...",
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    mode: {
      type: String,
      enum: ["online", "offline"],
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
      default: function () {
        return this.capacity;
      },
    },

    status: {
      type: String,
      enum: ["UPCOMING", "ONGOING", "COMPLETED", "ARCHIVED"],
      default: "UPCOMING",
    },

    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },

    eligibilityRules: {
      minAge: {
        type: Number,
        default: 0,
      },
      maxAge: {
        type: Number,
        default: 100,
      },
    },
  },
  {
    timestamps: true,
  },
);

const eventModel = mongoose.model("Event", eventSchema);
module.exports = eventModel;
