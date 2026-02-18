const express = require("express");
const router = express.Router();
const {
  getOrganizerDashboard,
  getEventRegistrations,
  markAttendanceBulk,
  eventDeletion,
  archieveEvent,
  unarchieveEvent,
} = require("../controller/organizerDashboard.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const handleValidationErrors = require("../middleware/handleValidationErrors.middleware");
const { body, param } = require("express-validator");

// Dashboard stats and event count
router.get("/dashboard", authMiddleware, getOrganizerDashboard);

// Registrations for specific event
router.get(
  "/event/:eventId/registrations",
  authMiddleware,
  getEventRegistrations,
);

router.post(
  "/:eventId/registrations/mark-attendance",
  authMiddleware,
  roleMiddleware("ORGANIZER"),
  [param("eventId").isMongoId().withMessage("Invalid event ID")],
  body("attendance")
    .isArray({ min: 1 })
    .withMessage("Attendance data must be a non-empty array"),
  body("attendance.*.id")
    .isMongoId()
    .withMessage("Each attendance entry must have a valid registration ID"),
  body("attendance.*.attended")
    .isBoolean()
    .withMessage("Each attendance entry must have an attended boolean"),
  handleValidationErrors,
  markAttendanceBulk,
);

router.delete(
  "/event/:eventId",
  authMiddleware,
  roleMiddleware("ORGANIZER"),
  [param("eventId").isMongoId().withMessage("Invalid event ID")],
  eventDeletion,
);
router.put(
  "/event/:eventId/archive",
  authMiddleware,
  roleMiddleware("ORGANIZER"),
  [param("eventId").isMongoId().withMessage("Invalid event ID")],
  archieveEvent,
);
router.put(
  "/event/:eventId/unarchive",
  authMiddleware,
  roleMiddleware("ORGANIZER"),
  [param("eventId").isMongoId().withMessage("Invalid event ID")],
  unarchieveEvent,
);

module.exports = router;
