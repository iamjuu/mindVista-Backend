const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: 'rzp_test_RMhvZDD0dxSGn0',
  key_secret: 'GdpGTV33xbiECOV5TlWwDaab',
});

// Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    if (!amount || !currency || !receipt) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const options = {
      amount, // in smallest currency unit (paise)
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

// Verify Razorpay payment
exports.verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing payment details" });
  }

  const generated_signature = crypto
    .createHmac('sha256', 'GdpGTV33xbiECOV5TlWwDaab')
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
};
