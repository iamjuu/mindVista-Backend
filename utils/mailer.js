const nodemailer = require('nodemailer');

// Create transporter for nodemailer
const createTransporter = () => {
    // Check if environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in your .env file');
    }
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send email notification when appointment is approved
const sendApprovalEmail = async (patientEmail, patientName, doctorName, appointmentDate, appointmentTime) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: patientEmail,
            subject: 'Appointment Approved - MindVista Psychology',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🎉 Appointment Approved!</h1>
                            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Your appointment has been confirmed</p>
                        </div>
                        
                        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 25px;">
                            <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">Appointment Details</h2>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <strong style="color: #374151;">Patient Name:</strong><br>
                                    <span style="color: #6b7280;">${patientName}</span>
                                </div>
                                <div>
                                    <strong style="color: #374151;">Doctor:</strong><br>
                                    <span style="color: #6b7280;">${doctorName}</span>
                                </div>
                                <div>
                                    <strong style="color: #374151;">Date:</strong><br>
                                    <span style="color: #6b7280;">${appointmentDate}</span>
                                </div>
                                <div>
                                    <strong style="color: #374151;">Time:</strong><br>
                                    <span style="color: #6b7280;">${appointmentTime}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
                            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">📋 Important Information</h3>
                            <ul style="color: #78350f; margin: 0; padding-left: 20px;">
                                <li>Please arrive 10 minutes before your scheduled time</li>
                                <li>Bring any relevant medical documents or reports</li>
                                <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
                                <li>For any questions, reach out to our support team</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #6b7280; margin: 0; font-size: 14px;">
                                Thank you for choosing MindVista Psychology.<br>
                                We look forward to helping you on your mental health journey.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                This is an automated email. Please do not reply to this message.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Approval email sent successfully to:', patientEmail);
        console.log('📧 Message ID:', info.messageId);
        console.log('👤 Patient:', patientName);
        console.log('👨‍⚕️ Doctor:', doctorName);
        console.log('📅 Date:', appointmentDate);
        console.log('⏰ Time:', appointmentTime);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending approval email to:', patientEmail);
        console.error('Error details:', error.message);
        return { success: false, error: error.message };
    }
};

// Send email notification when appointment is declined
const sendDeclineEmail = async (patientEmail, patientName, doctorName, appointmentDate, appointmentTime, reason) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: patientEmail,
            subject: 'Appointment Update - MindVista Psychology',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #dc2626; margin: 0; font-size: 28px;">📅 Appointment Update</h1>
                            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Your appointment request has been reviewed</p>
                        </div>
                        
                        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 25px;">
                            <h2 style="color: #991b1b; margin: 0 0 15px 0; font-size: 20px;">Appointment Details</h2>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <strong style="color: #374151;">Patient Name:</strong><br>
                                    <span style="color: #6b7280;">${patientName}</span>
                                </div>
                                <div>
                                    <strong style="color: #374151;">Doctor:</strong><br>
                                    <span style="color: #6b7280;">${doctorName}</span>
                                </div>
                                <div>
                                    <strong style="color: #374151;">Date:</strong><br>
                                    <span style="color: #6b7280;">${appointmentDate}</span>
                                </div>
                                <div>
                                    <strong style="color: #374151;">Time:</strong><br>
                                    <span style="color: #6b7280;">${appointmentTime}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
                            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">ℹ️ Status Update</h3>
                            <p style="color: #78350f; margin: 0; line-height: 1.6;">
                                Unfortunately, your appointment request for the above date and time cannot be accommodated at this moment. 
                                ${reason ? `Reason: ${reason}` : ''}
                            </p>
                            <p style="color: #78350f; margin: 15px 0 0 0; line-height: 1.6;">
                                We encourage you to try booking an alternative time slot or contact our support team for assistance.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #6b7280; margin: 0; font-size: 14px;">
                                We apologize for any inconvenience caused.<br>
                                Thank you for your understanding.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                This is an automated email. Please do not reply to this message.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Decline email sent successfully to:', patientEmail);
        console.log('📧 Message ID:', info.messageId);
        console.log('👤 Patient:', patientName);
        console.log('👨‍⚕️ Doctor:', doctorName);
        console.log('📅 Date:', appointmentDate);
        console.log('⏰ Time:', appointmentTime);
        if (reason) console.log('📝 Reason:', reason);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending decline email to:', patientEmail);
        console.error('Error details:', error.message);
        return { success: false, error: error.message };
    }
};

// Send doctor approval email
const sendDoctorApprovalEmail = async (doctorEmail, doctorName) => {
    try {
        const transporter = createTransporter();
console.log(process.env.EMAIL_PASS,'data gotted')

        const mailOptions = {
    
            from: process.env.EMAIL_USER,
            to: doctorEmail,
            subject: 'Doctor Account Approved - MindVista Psychology',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #059669; margin: 0; font-size: 28px;">🎉 Account Approved!</h1>
                            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Welcome to MindVista Psychology</p>
                        </div>
                        
                        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; margin-bottom: 25px;">
                            <h2 style="color: #047857; margin: 0 0 15px 0; font-size: 20px;">Congratulations Dr. ${doctorName}!</h2>
                            <p style="color: #065f46; margin: 0; line-height: 1.6;">
                                Your doctor account has been successfully approved and activated. You can now:
                            </p>
                            <ul style="color: #065f46; margin: 15px 0 0 0; padding-left: 20px;">
                                <li>Receive appointment requests from patients</li>
                                <li>Manage your schedule and availability</li>
                                <li>Access patient information and medical records</li>
                                <li>Use all platform features</li>
                            </ul>
                        </div>
                        
                        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
                            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">📋 Next Steps</h3>
                            <ul style="color: #78350f; margin: 0; padding-left: 20px;">
                                <li>Complete your profile with additional information</li>
                                <li>Set your availability and working hours</li>
                                <li>Review and respond to appointment requests</li>
                                <li>Familiarize yourself with the platform</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #6b7280; margin: 0; font-size: 14px;">
                                Welcome to our team! We're excited to have you join MindVista Psychology.<br>
                                If you have any questions, please don't hesitate to contact our support team.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                This is an automated email. Please do not reply to this message.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Doctor approval email sent successfully to:', doctorEmail);
        console.log('📧 Message ID:', info.messageId);
        console.log('👨‍⚕️ Doctor:', doctorName);
        console.log('🎉 Welcome email sent for account activation');
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending doctor approval email to:', doctorEmail);
        console.error('Error details:', error.message);
        return { success: false, error: error.message };
    }
};

// Send email notification when appointment is approved with video call link
const sendApprovalEmailWithVideoCall = async (patientEmail, patientName, doctorName, appointmentDate, appointmentTime, videoCallLink) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: patientEmail,
            subject: 'Appointment Approved - MindVista Psychology (Video Call Included)',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🎉 Appointment Approved!</h1>
                            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Your appointment has been confirmed with video call access</p>
                        </div>
                        
                        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 25px;">
                            <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">Appointment Details</h2>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <strong style="color: #374151;">Patient Name:</strong><br>
                                    <span style="color: #6b7280;">${patientName}</span>
                                </div>
                                <div>
                                    <strong style="color: #374151;">Doctor:</strong><br>
                                    <span style="color: #6b7280;">${doctorName}</span>
                                </div>
                                <div>
                                    <strong style="color: #374151;">Date:</strong><br>
                                    <span style="color: #6b7280;">${appointmentDate}</span>
                                </div>
                                <div>
                                    <strong style="color: #374151;">Time:</strong><br>
                                    <span style="color: #6b7280;">${appointmentTime}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 25px;">
                            <h3 style="color: #047857; margin: 0 0 15px 0; font-size: 18px;">📹 Video Call Access</h3>
                            <p style="color: #065f46; margin: 0 0 15px 0; line-height: 1.6;">
                                Your appointment includes a secure video call session. Click the link below at your scheduled appointment time:
                            </p>
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="${videoCallLink}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                    🎥 Join Video Call
                                </a>
                            </div>
                            <p style="color: #065f46; margin: 0; font-size: 14px; text-align: center;">
                                <strong>Video Call Link:</strong><br>
                                <span style="font-family: monospace; background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${videoCallLink}</span>
                            </p>
                        </div>
                        
                        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
                            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">📋 Important Information</h3>
                            <ul style="color: #78350f; margin: 0; padding-left: 20px;">
                                <li>Join the video call 5-10 minutes before your scheduled time</li>
                                <li>Ensure you have a stable internet connection</li>
                                <li>Test your camera and microphone beforehand</li>
                                <li>Find a quiet, private space for your session</li>
                                <li>Keep your video call link secure and don't share it with others</li>
                                <li>If you have technical issues, contact our support team immediately</li>
                            </ul>
                        </div>
                        
                        <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 25px;">
                            <p style="color: #991b1b; margin: 0; font-size: 14px; font-weight: bold;">
                                🔒 Security Notice: This video call link is unique to your appointment. Do not share it with anyone else.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #6b7280; margin: 0; font-size: 14px;">
                                Thank you for choosing MindVista Psychology.<br>
                                We look forward to helping you on your mental health journey.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                This is an automated email. Please do not reply to this message.<br>
                                For technical support, contact our support team.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Approval email with video call link sent successfully to:', patientEmail);
        console.log('📧 Message ID:', info.messageId);
        console.log('👤 Patient:', patientName);
        console.log('👨‍⚕️ Doctor:', doctorName);
        console.log('📅 Date:', appointmentDate);
        console.log('⏰ Time:', appointmentTime);
        console.log('🎥 Video Call Link:', videoCallLink);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending approval email with video call to:', patientEmail);
        console.error('Error details:', error.message);
        return { success: false, error: error.message };
    }
};

// Send generic notification email
const sendNotificationEmail = async (userEmail, userName, title, message, metadata = {}) => {
    try {
        const transporter = createTransporter();

        // Format date and time if they exist in metadata
        let dateTimeInfo = '';
        if (metadata.date && metadata.time) {
            dateTimeInfo = `
                <div style="background-color: #f0f9ff; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
                    <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">📅 Schedule Information</h3>
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #93c5fd;">
                        <ul style="color: #1e40af; margin: 0; padding-left: 0; list-style: none;">
                            <li style="margin-bottom: 12px; padding-left: 25px; position: relative;">
                                <span style="position: absolute; left: 0; top: 2px; color: #3b82f6; font-size: 16px;">📅</span>
                                <strong>Date:</strong> ${metadata.date}
                            </li>
                            <li style="margin-bottom: 0; padding-left: 25px; position: relative;">
                                <span style="position: absolute; left: 0; top: 2px; color: #3b82f6; font-size: 16px;">⏰</span>
                                <strong>Time:</strong> ${metadata.time}
                            </li>
                        </ul>
                    </div>
                </div>
            `;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `${title} - MindVista Psychology`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #1e293b; margin: 0; font-size: 28px; font-weight: 600;">📋 ${title}</h1>
                            <p style="color: #64748b; margin: 10px 0 0 0; font-size: 16px;">Your notification checklist from MindVista Psychology</p>
                        </div>
                        
                        <div style="background-color: #f1f5f9; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
                            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📝 Notification Details</h2>
                            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 16px;">${message}</p>
                            </div>
                        </div>
                        
                        ${dateTimeInfo}
                        
                        <div style="background-color: #fef3c7; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
                            <h3 style="color: #92400e; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">✅ Action Items</h3>
                            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #fbbf24;">
                                <ul style="color: #78350f; margin: 0; padding-left: 0; list-style: none;">
                                    <li style="margin-bottom: 12px; padding-left: 25px; position: relative;">
                                        <span style="position: absolute; left: 0; top: 2px; color: #f59e0b; font-size: 16px;">☐</span>
                                        Keep this notification for your records
                                    </li>
                                    <li style="margin-bottom: 12px; padding-left: 25px; position: relative;">
                                        <span style="position: absolute; left: 0; top: 2px; color: #f59e0b; font-size: 16px;">☐</span>
                                        Contact our support team if you have questions
                                    </li>
                                    <li style="margin-bottom: 12px; padding-left: 25px; position: relative;">
                                        <span style="position: absolute; left: 0; top: 2px; color: #f59e0b; font-size: 16px;">☐</span>
                                        Call our helpline for urgent matters
                                    </li>
                                    <li style="margin-bottom: 0; padding-left: 25px; position: relative;">
                                        <span style="position: absolute; left: 0; top: 2px; color: #f59e0b; font-size: 16px;">☐</span>
                                        Stay updated with your mental health journey
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #10b981;">
                            <h3 style="color: #047857; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">🎯 Next Steps</h3>
                            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #6ee7b7;">
                                <ul style="color: #065f46; margin: 0; padding-left: 0; list-style: none;">
                                    <li style="margin-bottom: 8px; padding-left: 25px; position: relative;">
                                        <span style="position: absolute; left: 0; top: 2px; color: #10b981; font-size: 14px;">✓</span>
                                        Review the notification details above
                                    </li>
                                    <li style="margin-bottom: 8px; padding-left: 25px; position: relative;">
                                        <span style="position: absolute; left: 0; top: 2px; color: #10b981; font-size: 14px;">✓</span>
                                        Take any required actions
                                    </li>
                                    <li style="margin-bottom: 0; padding-left: 25px; position: relative;">
                                        <span style="position: absolute; left: 0; top: 2px; color: #10b981; font-size: 14px;">✓</span>
                                        Contact us if you need assistance
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
                            <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">
                                <strong>Thank you for choosing MindVista Psychology.</strong><br>
                                We're committed to supporting your mental health journey.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                                This is an automated email. Please do not reply to this message.<br>
                                For support, contact our team through the platform.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Notification email sent successfully to:', userEmail);
        console.log('📧 Message ID:', info.messageId);
        console.log('👤 User:', userName);
        console.log('📝 Title:', title);
        console.log('📅 Date:', metadata.date || 'N/A');
        console.log('⏰ Time:', metadata.time || 'N/A');
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending notification email to:', userEmail);
        console.error('Error details:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendApprovalEmail,
    sendDeclineEmail,
    sendDoctorApprovalEmail,
    sendApprovalEmailWithVideoCall,
    sendNotificationEmail
};
