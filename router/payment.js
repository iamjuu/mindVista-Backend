const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  verifyPayment, 
  getPaymentDetails, 
  refundPayment 
} = require('../controller/payment');

// Create Razorpay order
router.post('/create-order', createOrder);

// Verify payment signature
router.post('/verify-payment', verifyPayment);

// Get payment details by order ID
router.get('/payment-details/:orderId', getPaymentDetails);

// Process refund
router.post('/refund', refundPayment);

module.exports = router;
