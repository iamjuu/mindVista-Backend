const mongoose = require('mongoose')

const appoinmentSchema = new mongoose.Schema({
    name: {
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
        type: String,
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
    register: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'register',
        required: false
    }
}, {
    timestamps: true
})

const Appoinment = mongoose.model('appoinment', appoinmentSchema)
module.exports = Appoinment
