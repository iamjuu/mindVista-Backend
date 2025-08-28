const mongoose = require('mongoose')

const appoinmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined', 'confirmed'],
        default: 'pending'
    },
    time: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    payment: {
        type: Boolean,
        default: false
    },
    // New fields for payment and receipt handling
    slot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night'],
        default: 'morning'
    },
    doctorName: {
        type: String,
        required: false
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentCompletedAt: {
        type: Date,
        default: null
    },
    receiptUploaded: {
        type: Boolean,
        default: false
    },
    receiptFile: {
        type: String,
        default: null
    },
    // Additional fields for better tracking
    appointmentId: {
        type: String,
        default: null
    },
    // Video call fields
    videoCallLink: {
        type: String,
        default: null
    },
    videoCallId: {
        type: String,
        default: null
    },
    videoCallGenerated: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
})

const Appoinment = mongoose.model('appoinment', appoinmentSchema)
module.exports = Appoinment
