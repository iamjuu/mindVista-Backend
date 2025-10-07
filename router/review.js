const express = require('express');
const router = express.Router();
const ReviewController = require('../controller/review');

// List reviews
router.get('/reviews', ReviewController.list);

// Create review
router.post('/reviews', ReviewController.create);

// Update review
router.put('/reviews/:id', ReviewController.update);

// Toggle active
router.patch('/reviews/:id/active', ReviewController.toggleActive);

module.exports = router;


