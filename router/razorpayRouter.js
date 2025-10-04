const express = require('express');
const { createOrder, verifyPayment } = require('../controller/razorpay');

const router = express.Router();

// Create order
router.post('/create-order', createOrder);

// Verify payment
router.post('/verify-payment', verifyPayment);

module.exports = router;
