const express = require('express');
const router = express.Router();
const organizerReviewController = require('../controller/organizerReview.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// List all organizers
router.get('/organizers', authMiddleware, organizerReviewController.organizerList);

// review and details for an organizer
router.get('/organizer/:organizerId', organizerReviewController.getOrganizerDetails);

// review creation
router.post('/organizer/:organizerId/reviews', authMiddleware, roleMiddleware("USER"), organizerReviewController.createReview);

module.exports = router;
