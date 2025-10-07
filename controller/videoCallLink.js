const { v4: uuidv4 } = require("uuid");
const generateVideoCallLink = require('../utils/videoCall');
const appoinment = require('../models/appoiment')
module.exports = {
    VideoCallLink: (req, res) => {
        try {
            const { appointmentId, doctorId, patientName } = req.body;
            
            if (!appointmentId || !doctorId || !patientName) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: appointmentId, doctorId, patientName'
                });
            }

            const videoCallResult = generateVideoCallLink(
                appointmentId,
                doctorId,
                patientName
            );

            if (videoCallResult.success) {
                res.status(200).json({
                    success: true,
                    data: {
                        videoCallId: videoCallResult.videoCallId,
                        videoCallLink: videoCallResult.videoCallLink,
                        generatedAt: videoCallResult.generatedAt
                    },
                    message: 'Video call link generated successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to generate video call link',
                    error: videoCallResult.error
                });
            }
        } catch (error) {
            console.error('Error generating video call link:', error);
            res.status(500).json({
                success: false,
                message: 'Error generating video call link',
                error: error.message
            });
        }
    },

    // Generate a simple unique link for testing
    generateSimpleLink: (req, res) => {
        try {
            const uniqueId = uuidv4();
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const videoCallLink = `${baseUrl}/video-call/${uniqueId}`;
            
            res.status(200).json({
                success: true,
                data: {
                    videoCallId: uniqueId,
                    videoCallLink: videoCallLink,
                    generatedAt: new Date()
                },
                message: 'Simple video call link generated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error generating video call link",
                error: error.message
            });
        }
    },
    endsession: async (req, res) => {
        console.log("📩 Incoming request body:", req.body);
      
        try {
          const { videoCallId } = req.body;
      
          // ✅ Step 1: Validate input
          if (!videoCallId) {
            console.warn("⚠️ Missing videoCallId in request body");
            return res
              .status(400)
              .json({ success: false, message: "videoCallId is required" });
          }
      
          console.log("🔍 Searching for appointment with videoCallId:", videoCallId);
      
          // ✅ Step 2: Find and update
          const updatedAppointment = await appoinment.findOneAndUpdate(
            { videoCallId },
            { $set: { sessionEnd: true } },
            { new: true }
          );
      
          // ✅ Step 3: Handle not found
          if (!updatedAppointment) {
            console.warn("❌ Appointment not found for videoCallId:", videoCallId);
            return res
              .status(404)
              .json({ success: false, message: "Appointment not found" });
          }
      
          // ✅ Step 4: Success
          console.log("✅ Session ended successfully for:", updatedAppointment.name);
          res.status(200).json({
            success: true,
            message: "Session ended successfully",
            data: updatedAppointment,
          });
        } catch (error) {
          // ✅ Step 5: Error handling
          console.error("💥 Error ending session:", error);
          res
            .status(500)
            .json({ success: false, message: "Internal Server Error", error: error.message });
        }
      }
      
}