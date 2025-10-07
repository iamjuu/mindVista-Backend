const express = require('express');
const router = express.Router();
const ReviewController = require('../controller/review');

// List reviews
router.get('/reviews', ReviewController.list);

// Create review
router.post('/reviews', ReviewController.create);

module.exports = router;


