const Notification = require('../models/notification');
const Appoinment = require('../models/appoiment');
const { sendNotificationEmail } = require('../utils/mailer');

module.exports = {
    // create notification
    notificationsent: async (req, res) => {
        try {
            const { userId, title, message, type = 'info', metadata = {} } = req.body;

            console.log(metadata,'data gotter')
            if (!userId || !title || !message) {
                return res.status(400).json({ success: false, message: 'userId, title and message are required' });
            }

            const created = await Notification.create({ userId, title, message, type, metadata });
            
            // Send email if metadata contains date and time
            if (metadata.date && metadata.time) {
                try {
                    // Fetch user details from appointment
                    const appointment = await Appoinment.findById(userId);
                    if (appointment && appointment.email) {
                        console.log('📧 Sending notification email to:', appointment.email);
                        const emailResult = await sendNotificationEmail(
                            appointment.email,
                            appointment.name,
                            title,
                            message,
                            metadata
                        );
                        
                        if (emailResult.success) {
                            console.log('✅ Email sent successfully for notification:', created._id);
                        } else {
                            console.error('❌ Failed to send email for notification:', created._id, emailResult.error);
                        }
                    } else {
                        console.log('⚠️ No email found for user:', userId, 'or appointment not found');
                    }
                } catch (emailError) {
                    console.error('❌ Error sending notification email:', emailError.message);
                    // Don't fail the notification creation if email fails
                }
            }
            
            return res.status(201).json({ success: true, data: created });
            
        } catch (error) {
            console.error('notificationsent error:', error);
            return res.status(500).json({ success: false, message: 'Failed to create notification' });
        }
    },

    // list notifications for a user
    listByUser: async (req, res) => {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({ success: false, message: 'userId param is required' });
            }
            const { onlyUnread } = req.query;
            const query = { userId };
            if (onlyUnread === 'true') query.isRead = false;

            const notifications = await Notification.find(query).sort({ createdAt: -1 });
            return res.json({ success: true, data: notifications });
        } catch (error) {
            console.error('listByUser error:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
        }
    },

    // mark single notification as read
    markRead: async (req, res) => {
        try {
            const { id } = req.params;
            const updated = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
            if (!updated) return res.status(404).json({ success: false, message: 'Notification not found' });
            return res.json({ success: true, data: updated });
        } catch (error) {
            console.error('markRead error:', error);
            return res.status(500).json({ success: false, message: 'Failed to mark as read' });
        }
    },

    // mark all notifications for a user as read
    markAllReadForUser: async (req, res) => {
        try {
            const { userId } = req.params;
            if (!userId) return res.status(400).json({ success: false, message: 'userId param is required' });
            await Notification.updateMany({ userId, isRead: false }, { isRead: true });
            return res.json({ success: true });
        } catch (error) {
            console.error('markAllReadForUser error:', error);
            return res.status(500).json({ success: false, message: 'Failed to mark all as read' });
        }
    },

    // delete a notification
    remove: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Notification.findByIdAndDelete(id);
            if (!deleted) return res.status(404).json({ success: false, message: 'Notification not found' });
            return res.json({ success: true });
        } catch (error) {
            console.error('remove error:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete notification' });
        }
    }
};