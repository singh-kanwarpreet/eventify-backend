const express = require("express");
const { body } = require("express-validator");
const authController = require("../controller/auth.controller");
const handleValidationErrors = require("../middleware/handleValidationErrors.middleware");
const router = express.Router();

// Signup
router.post(
  "/user/signUp",
  [
    body("name").notEmpty().withMessage("Name is required"),

    body("email").isEmail().withMessage("Valid email is required"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("phone")
      .matches(/^[0-9]{10}$/)
      .withMessage("Phone must be 10 digits"),

    body("dateOfBirth").isDate().withMessage("Valid date of birth is required"),

    body("role")
      .optional()
      .isIn(["USER", "ORGANIZER"])
      .withMessage("Role must be USER or ORGANIZER"),

    // Conditional validation
    body("organizationName")
      .if(body("role").equals("ORGANIZER"))
      .notEmpty()
      .withMessage("Organization name is required for organizers"),

    body("description")
      .if(body("role").equals("ORGANIZER"))
      .notEmpty()
      .withMessage("Description is required for organizers"),
  ],
  handleValidationErrors,
  authController.signUp
);

// Login
router.post(
  "/user/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleValidationErrors,
  authController.login
);

router.get("/user/logout", authController.logOut);

module.exports = router;
