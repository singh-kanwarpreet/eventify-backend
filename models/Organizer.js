const mongoose = require("mongoose");

const organizerSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRating: { type: Number, default: 0 },
    reviewCount: {
      type: Number,
      default: 0,
    },
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const organizerModel = mongoose.model("Organizer", organizerSchema);

module.exports = organizerModel;
