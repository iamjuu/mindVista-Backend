const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_R6TXpHwdckbvvZ',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'CLOIqvgZbUfP86lysVma5Nzn'
});

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const { amount, currency, appointmentData } = req.body;

    // Validate required fields
    if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Amount and currency are required'
      });
    }

    // Create order options
    const options = {
      amount: amount, // amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        appointmentId: appointmentData?.appointmentId || 'temp-id',
        patientName: appointmentData?.name || 'Patient',
        doctorName: appointmentData?.doctorName || 'Doctor'
      }
    };

    // Create order with Razorpay
    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      message: 'Order created successfully',
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Verify payment signature
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appointmentData
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification parameters are missing'
      });
    }

    // Create signature for verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
         const expectedSignature = crypto
       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'CLOIqvgZbUfP86lysVma5Nzn')
       .update(body.toString())
       .digest("hex");

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }

    // Here you can update your appointment status to confirmed
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        appointmentData: appointmentData
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// Get payment details by order ID
const getPaymentDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Fetch order details from Razorpay
    const order = await razorpay.orders.fetch(orderId);

    res.status(200).json({
      success: true,
      message: 'Order details fetched successfully',
      data: order
    });

  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
};

// Refund payment
const refundPayment = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    // Refund options
    const refundOptions = {
      payment_id: paymentId,
      amount: amount || null, // If amount is not provided, full amount will be refunded
      speed: 'normal', // normal, instant
      notes: {
        reason: reason || 'Refund requested'
      }
    };

    // Process refund with Razorpay
    const refund = await razorpay.payments.refund(refundOptions);

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: refund
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentDetails,
  refundPayment
};
