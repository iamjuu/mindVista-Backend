const { sendApprovalEmail, sendDeclineEmail } = require('../utils/mailer');

module.exports = {
    // Send email notification when appointment is approved
    sendApprovalEmail: async (req, res) => {
        try {
            const { appointmentId, patientName, patientEmail, doctorName, appointmentDate, appointmentTime } = req.body;
            
            // Validate required fields
            if (!appointmentId || !patientName || !patientEmail || !doctorName || !appointmentDate || !appointmentTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: appointmentId, patientName, patientEmail, doctorName, appointmentDate, appointmentTime'
                });
            }

            // Use the utility function to send email
            const emailResult = await sendApprovalEmail(patientEmail, patientName, doctorName, appointmentDate, appointmentTime);
            
            if (emailResult.success) {
                res.status(200).json({
                    success: true,
                    message: 'Approval email sent successfully',
                    messageId: emailResult.messageId
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to send approval email',
                    error: emailResult.error
                });
            }

        } catch (error) {
            console.error('Error sending approval email:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send approval email',
                error: error.message
            });
        }
    },

    // Send email notification when appointment is declined
    sendDeclineEmail: async (req, res) => {
        try {
            const { appointmentId, patientName, patientEmail, doctorName, appointmentDate, appointmentTime, reason } = req.body;
            
            // Validate required fields
            if (!appointmentId || !patientName || !patientEmail || !doctorName || !appointmentDate || !appointmentTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: appointmentId, patientName, patientEmail, doctorName, appointmentDate, appointmentTime'
                });
            }

            // Use the utility function to send email
            const emailResult = await sendDeclineEmail(patientEmail, patientName, doctorName, appointmentDate, appointmentTime, reason);
            
            if (emailResult.success) {
                res.status(200).json({
                    success: true,
                    message: 'Decline email sent successfully',
                    messageId: emailResult.messageId
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to send decline email',
                    error: emailResult.error
                });
            }

        } catch (error) {
            console.error('Error sending decline email:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send decline email',
                error: error.message
            });
        }
    }
};
