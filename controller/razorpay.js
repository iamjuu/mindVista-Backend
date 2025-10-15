const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');

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
exports.verifyPayment = async (req, res) => {
  console.log('verifyPayment', req.body);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId, amount } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing payment details" });
  }

  // Validate appointmentId format if provided
  if (appointmentId && !mongoose.Types.ObjectId.isValid(appointmentId)) {
    console.log('❌ Invalid appointmentId format:', appointmentId);
    return res.status(400).json({ success: false, message: "Invalid appointment ID format" });
  }

  const generated_signature = crypto
    .createHmac('sha256', 'GdpGTV33xbiECOV5TlWwDaab')
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');
console.log('generated_signature', generated_signature);
  if (generated_signature === razorpay_signature) {
    console.log('✅ Payment signature verified successfully')
    // Update appointment payment status to completed
    if (appointmentId) {
      console.log('📝 Updating appointment payment status for ID:', appointmentId);
      try {
        const Appoinment = require('../models/appoiment');
        const appointment = await Appoinment.findById(appointmentId);
        
        if (appointment) {
          appointment.paymentStatus = 'completed';
          appointment.payment = true;
          console.log('paymentCompletedAt');
          console.log('payment');
          console.log('paymentStatus', 'completed');
          appointment.paymentCompletedAt = new Date();
          if (amount) {
            appointment.amount = amount;
          }
          await appointment.save();
          

          // Add amount to corresponding doctor's salary
          if (appointment.doctor && amount) {
            try {
              const Doctor = require('../models/doctor');
              const doctor = await Doctor.findById(appointment.doctor);
              
              if (doctor) {
                // Add exact amount to existing salary (accumulate total)
                doctor.selary = (doctor.selary || 0) + amount;
                await doctor.save();
                console.log(`✅ Added ₹${amount} to doctor ${doctor.name}'s salary. New total salary: ₹${doctor.selary}`);
              } else {
                console.log('⚠️ Doctor not found for ID:', appointment.doctor);
              }
            } catch (doctorUpdateError) {
              console.error('❌ Error updating doctor salary:', doctorUpdateError);
            }
          }

          
          console.log('✅ Payment status updated to completed for appointment:', appointmentId);
        } else {
          console.log('⚠️ Appointment not found for ID:', appointmentId);
        }
      } catch (updateError) {
        console.error('❌ Error updating appointment payment status:', updateError);
        // Don't fail the payment verification if update fails
      }
    }
    
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    console.log('❌ Payment signature verification failed');
    // Update appointment payment status to failed
    if (appointmentId) {
      console.log('📝 Updating appointment payment status to failed for ID:', appointmentId);
      try {
        const Appoinment = require('../models/appoiment');
        const appointment = await Appoinment.findById(appointmentId);
        
        if (appointment) {
          appointment.paymentStatus = 'failed';
          appointment.payment = false;
          await appointment.save();
          
          console.log('❌ Payment status updated to failed for appointment:', appointmentId);
        }
      } catch (updateError) {
        console.error('❌ Error updating appointment payment status to failed:', updateError);
      }
    }
    
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
};
