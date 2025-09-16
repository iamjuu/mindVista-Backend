const mongoose = require('mongoose');
const Appoinment = require('./models/appoiment');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mindvista', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function testVideoCall() {
    try {
        console.log('🔍 Connecting to database...');
        
        // Find all appointments with video call IDs
        const appointments = await Appoinment.find({
            videoCallId: { $exists: true, $ne: null },
            videoCallGenerated: true
        }).populate('doctor', 'name specialization');
        
        console.log('📋 Found appointments with video call IDs:');
        appointments.forEach((appointment, index) => {
            console.log(`\n${index + 1}. Appointment Details:`);
            console.log(`   ID: ${appointment._id}`);
            console.log(`   Name: ${appointment.name}`);
            console.log(`   Status: ${appointment.status}`);
            console.log(`   Date: ${appointment.date}`);
            console.log(`   Time: ${appointment.time}`);
            console.log(`   Video Call ID: ${appointment.videoCallId}`);
            console.log(`   Video Call Link: ${appointment.videoCallLink}`);
            console.log(`   Doctor: ${appointment.doctor?.name || appointment.doctorName}`);
        });
        
        if (appointments.length > 0) {
            const firstAppointment = appointments[0];
            console.log(`\n🧪 Testing video call endpoint with ID: ${firstAppointment.videoCallId}`);
            
            // Test the video call details endpoint
            const axios = require('axios');
            try {
                const response = await axios.get(`http://localhost:3000/video-call/${firstAppointment.videoCallId}/details`);
                console.log('✅ Video call endpoint response:', response.data);
            } catch (error) {
                console.log('❌ Video call endpoint error:', error.response?.data || error.message);
            }
        } else {
            console.log('❌ No appointments with video call IDs found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

testVideoCall();





