const OrganizerReview = require("../models/OrganizerReview");
const Organizer = require("../models/Organizer");
// List all organizers
const organizerList = async (req, res) => {
  try {
    const organizers = await Organizer.find().populate("managedBy", "name");

    res.json(organizers);
  } catch (error) {
    console.error("Error fetching organizers:", error);
    res.status(500).json({ error: "Failed to fetch organizers" });
  }
};

// organizer details with reviews
const getOrganizerDetails = async (req, res) => {
  const { organizerId } = req.params;
  try {
    const organizer = await Organizer.findById(organizerId).populate(
      "managedBy",
      "name",
    );
    if (!organizer) {
      return res.status(404).json({ error: "Organizer not found" });
    }
    const reviews = await OrganizerReview.find({ organizerId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });
    res.json({ organizer, reviews });
  } catch (error) {
    console.error("Error fetching organizer details:", error);
    res.status(500).json({ error: "Failed to fetch organizer details" });
  }
};

// review creation
const createReview = async (req, res) => {
  const { organizerId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;
  const userName = req.user.name;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  if (!comment || comment.length < 5) {
    return res
      .status(400)
      .json({ error: "Comment must be at least 5 characters" });
  }

  try {
    const newReview = new OrganizerReview({
      organizerId,
      userId,
      rating,
      comment,
    });
    await newReview.save();

    await Organizer.findByIdAndUpdate(
      organizerId,
      [
        {
          $set: {
            reviewCount: { $add: ["$reviewCount", 1] },
            totalRating: { $add: ["$totalRating", rating] },
          },
        },
        {
          $set: {
            averageRating: { $divide: ["$totalRating", "$reviewCount"] },
          },
        },
      ],
      { new: true, updatePipeline: true },
    );

    const reviewWithUser = {
      ...newReview.toObject(),
      userId: {
        _id: userId,
        name: userName,
      },
    };

    res.status(201).json(reviewWithUser);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
};

module.exports = {
  organizerList,
  getOrganizerDetails,
  createReview,
};
