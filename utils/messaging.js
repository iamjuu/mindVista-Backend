const axios = require('axios');

/**
 * Send WhatsApp message with video call link
 * This generates a WhatsApp URL that can be used to send messages
 * For automated sending, you would need to integrate with WhatsApp Business API or Twilio
 */
const sendWhatsAppMessage = async (phone, patientName, doctorName, appointmentDate, appointmentTime, videoCallLink) => {
    try {
        // Format phone number (remove spaces, dashes, and add country code if needed)
        // Assuming India (+91) - adjust based on your country
        let formattedPhone = phone.replace(/[\s\-\(\)]/g, '');
        
        // Add country code if not present
        if (!formattedPhone.startsWith('91') && !formattedPhone.startsWith('+')) {
            formattedPhone = '91' + formattedPhone.replace(/^0+/, '');
        }
        
        // Remove + if present for WhatsApp URL
        formattedPhone = formattedPhone.replace('+', '');
        
        // Create message content
        const message = `Hello ${patientName}!\n\n` +
            `🎉 Your appointment with Dr. ${doctorName} has been approved!\n\n` +
            `📅 Date: ${appointmentDate}\n` +
            `⏰ Time: ${appointmentTime}\n\n` +
            `🎥 Join your video consultation:\n${videoCallLink}\n\n` +
            `Please join 5-10 minutes before your scheduled time.\n\n` +
            `Thank you,\nMindVista Psychology`;
        
        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);
        
        // Create WhatsApp URL
        const whatsappURL = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
        
        console.log('✅ WhatsApp link generated for:', formattedPhone);
        console.log('📱 WhatsApp URL:', whatsappURL);
        
        // Option 1: Return URL for manual/frontend sending
        return { 
            success: true, 
            whatsappURL,
            phone: formattedPhone,
            message: 'WhatsApp link generated successfully'
        };
        
        // Option 2: If you have Twilio configured, uncomment this section:
        /*
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            const twilio = require('twilio');
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            
            const result = await client.messages.create({
                from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
                to: `whatsapp:+${formattedPhone}`,
                body: message
            });
            
            console.log('✅ WhatsApp message sent via Twilio:', result.sid);
            return { success: true, messageId: result.sid, whatsappURL };
        }
        */
        
    } catch (error) {
        console.error('❌ Error generating WhatsApp message:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send SMS with video call link
 * Uses various SMS providers - configure based on your preference
 */
const sendSMS = async (phone, patientName, doctorName, appointmentDate, appointmentTime, videoCallLink) => {
    try {
        // Format phone number
        let formattedPhone = phone.replace(/[\s\-\(\)]/g, '');
        
        // Add country code if not present
        if (!formattedPhone.startsWith('91') && !formattedPhone.startsWith('+')) {
            formattedPhone = '+91' + formattedPhone.replace(/^0+/, '');
        } else if (formattedPhone.startsWith('91')) {
            formattedPhone = '+' + formattedPhone;
        }
        
        // Create SMS message (keep it short for SMS)
        const message = `MindVista: Your appointment with Dr. ${doctorName} on ${appointmentDate} at ${appointmentTime} is approved! Video link: ${videoCallLink}`;
        
        console.log('📱 SMS prepared for:', formattedPhone);
        console.log('📝 SMS content:', message);
        
        // Option 1: Using Twilio (most popular)
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
            try {
                const twilio = require('twilio');
                const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                
                const result = await client.messages.create({
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: formattedPhone,
                    body: message
                });
                
                console.log('✅ SMS sent via Twilio:', result.sid);
                return { 
                    success: true, 
                    messageId: result.sid,
                    provider: 'Twilio',
                    phone: formattedPhone
                };
            } catch (twilioError) {
                console.error('❌ Twilio SMS error:', twilioError.message);
                // Fall through to other options
            }
        }
        
        // Option 2: Using MSG91 (popular in India)
        if (process.env.MSG91_AUTH_KEY && process.env.MSG91_SENDER_ID) {
            try {
                const msg91Response = await axios.get('https://api.msg91.com/api/sendhttp.php', {
                    params: {
                        authkey: process.env.MSG91_AUTH_KEY,
                        mobiles: formattedPhone.replace('+', ''),
                        message: message,
                        sender: process.env.MSG91_SENDER_ID,
                        route: '4', // Transactional route
                        country: '91'
                    }
                });
                
                console.log('✅ SMS sent via MSG91:', msg91Response.data);
                return { 
                    success: true, 
                    response: msg91Response.data,
                    provider: 'MSG91',
                    phone: formattedPhone
                };
            } catch (msg91Error) {
                console.error('❌ MSG91 SMS error:', msg91Error.message);
                // Fall through
            }
        }
        
        // Option 3: Using Fast2SMS (popular in India)
        if (process.env.FAST2SMS_API_KEY) {
            try {
                const fast2smsResponse = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
                    route: 'v3',
                    sender_id: process.env.FAST2SMS_SENDER_ID || 'TXTIND',
                    message: message,
                    language: 'english',
                    flash: 0,
                    numbers: formattedPhone.replace(/^\+91/, '')
                }, {
                    headers: {
                        'authorization': process.env.FAST2SMS_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('✅ SMS sent via Fast2SMS:', fast2smsResponse.data);
                return { 
                    success: true, 
                    response: fast2smsResponse.data,
                    provider: 'Fast2SMS',
                    phone: formattedPhone
                };
            } catch (fast2smsError) {
                console.error('❌ Fast2SMS error:', fast2smsError.message);
                // Fall through
            }
        }
        
        // If no SMS provider is configured, return a warning but don't fail
        console.warn('⚠️ No SMS provider configured. SMS not sent.');
        console.warn('💡 Configure TWILIO, MSG91, or FAST2SMS in your .env file to enable SMS');
        
        return { 
            success: false, 
            error: 'No SMS provider configured',
            message: 'SMS functionality requires SMS provider configuration',
            phone: formattedPhone
        };
        
    } catch (error) {
        console.error('❌ Error sending SMS:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send appointment approval notification via all channels
 * This is a convenience function that sends via Email, WhatsApp, and SMS
 */
const sendMultiChannelNotification = async (
    patientEmail,
    patientPhone,
    patientName,
    doctorName,
    appointmentDate,
    appointmentTime,
    videoCallLink
) => {
    const results = {
        email: { success: false },
        whatsapp: { success: false },
        sms: { success: false }
    };
    
    try {
        // Send WhatsApp
        console.log('\n📱 Sending WhatsApp notification...');
        results.whatsapp = await sendWhatsAppMessage(
            patientPhone,
            patientName,
            doctorName,
            appointmentDate,
            appointmentTime,
            videoCallLink
        );
        
        // Send SMS
        console.log('\n📲 Sending SMS notification...');
        results.sms = await sendSMS(
            patientPhone,
            patientName,
            doctorName,
            appointmentDate,
            appointmentTime,
            videoCallLink
        );
        
        // Log summary
        console.log('\n📊 Multi-channel notification summary:');
        console.log('   WhatsApp:', results.whatsapp.success ? '✅ Success' : '❌ Failed');
        console.log('   SMS:', results.sms.success ? '✅ Success' : '❌ Failed');
        
        return results;
        
    } catch (error) {
        console.error('❌ Error in multi-channel notification:', error.message);
        return results;
    }
};

module.exports = {
    sendWhatsAppMessage,
    sendSMS,
    sendMultiChannelNotification
};
