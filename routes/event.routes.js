const express = require("express");
const multer = require("multer");
const { body, param } = require("express-validator");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const eligibilityRules = require("../middleware/eligibility.middleware");
const eventController = require("../controller/event.controller");
const handleValidationErrors = require("../middleware/handleValidationErrors.middleware");
const router = express.Router();

const memoryStorage = multer.memoryStorage();
const memoryParser = multer({ storage: memoryStorage });

// Creation of events
router.post(
  "/organizer/create",
  authMiddleware,
  roleMiddleware("ORGANIZER"),
  memoryParser.single("image"),

  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("startTime").isISO8601().withMessage("Valid startTime is required"),
    body("endTime").isISO8601().withMessage("Valid endTime is required"),
    body("location").notEmpty().withMessage("Location is required"),
    body("mode")
      .isIn(["online", "offline"])
      .withMessage("Mode must be online or offline"),
    body("capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
    body("eligibilityRules.minAge").optional().isInt({ min: 0 }),
    body("eligibilityRules.maxAge").optional().isInt({ min: 1 }),
  ],

  handleValidationErrors,

  eventController.eventCreate,
);


// List of events
router.get("/", eventController.eventGetAll);

// Event registeration
router.post(
  "/register/:eventId",
  authMiddleware,
  roleMiddleware("USER"),
  [param("eventId").isMongoId().withMessage("Invalid event ID")],
  handleValidationErrors,
  eligibilityRules,
  eventController.eventUserRegister,
);

// Event details by ID
router.get(
  "/:eventId",
  authMiddleware,
  [param("eventId").isMongoId().withMessage("Invalid event ID")],
  handleValidationErrors,
  eventController.eventGetById,
);

// User's registered events
router.get(
  "/registrations/my",
  authMiddleware,
  roleMiddleware("USER"),
  eventController.eventGetUserRegistrations,
);

// list of users registered for an event
router.get(
  "/:eventId/registrations",
  authMiddleware,
  roleMiddleware("ORGANIZER"),
  [param("eventId").isMongoId().withMessage("Invalid event ID")],
  handleValidationErrors,
  eventController.eventGetEventRegistrations,
);



module.exports = router;
