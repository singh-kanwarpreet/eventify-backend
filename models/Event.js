const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    image: {
      url: {
        type: String,
        default:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3BlY2lhbCUyMGV2ZW50fGVufDB8fDB8fHww",
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
      ref: "User",
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
