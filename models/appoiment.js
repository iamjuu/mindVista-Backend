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
        enum: ['pending', 'approved', 'declined'],
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

}, {
    timestamps: true
})

const Appoinment = mongoose.model('appoinment', appoinmentSchema)
module.exports = Appoinment
