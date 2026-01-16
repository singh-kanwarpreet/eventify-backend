const express = require("express");
const multer = require("multer");
const { body, param } = require("express-validator");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const eligibilityRules = require("../middleware/eligibility.middleware");
const eventController = require("../controller/event.controller");
const handleValidationErrors = require("../middleware/handleValidationErrors.middleware");
const router = express.Router();
const uploadToCloudinary = require("../middleware/upload.middleware");

const memoryStorage = multer.memoryStorage();
const memoryParser = multer({ storage: memoryStorage });

router.post(
  "/organizer/create",
  authMiddleware,
  roleMiddleware("ORGANIZER"),
  memoryParser.single("image"),

  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("dateTime").isISO8601().withMessage("Valid dateTime is required"),
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
  uploadToCloudinary("image"),

  eventController.eventCreate
);

router.get("/all", eventController.eventGetAll);

router.post(
  "/user/register/:eventId",
  authMiddleware,
  roleMiddleware("USER"),
  [param("eventId").isMongoId().withMessage("Invalid event ID")],
  handleValidationErrors,
  eligibilityRules,
  eventController.eventUserRegister
);

module.exports = router;
