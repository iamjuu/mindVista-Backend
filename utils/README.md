# Utils Directory - MindVista Backend

This directory contains utility functions for the MindVista Psychology application.

## 📁 Files Overview

### `mailer.js` - Email Notifications
Handles all email communications using Nodemailer.

**Functions:**
- `sendApprovalEmail()` - Send appointment approval email
- `sendDeclineEmail()` - Send appointment decline email
- `sendDoctorApprovalEmail()` - Send doctor account approval email
- `sendApprovalEmailWithVideoCall()` - Send approval email with video call link
- `sendNotificationEmail()` - Send generic notification email

**Configuration:**
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Usage:**
```javascript
const { sendApprovalEmailWithVideoCall } = require('./utils/mailer');

await sendApprovalEmailWithVideoCall(
    'patient@example.com',
    'John Doe',
    'Dr. Smith',
    '2026-03-10',
    '10:00 AM',
    'https://mindvista.com/video/abc123?role=patient'
);
```

---

### `messaging.js` - WhatsApp & SMS Notifications
Handles WhatsApp and SMS communications for appointment notifications.

**Functions:**
- `sendWhatsAppMessage()` - Generate WhatsApp URL with pre-filled message
- `sendSMS()` - Send SMS via configured provider (Twilio/MSG91/Fast2SMS)
- `sendMultiChannelNotification()` - Send via both WhatsApp and SMS

**Configuration (Optional - Choose ONE):**

**Twilio:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

**MSG91 (India):**
```env
MSG91_AUTH_KEY=your_key
MSG91_SENDER_ID=MINDVS
```

**Fast2SMS (India):**
```env
FAST2SMS_API_KEY=your_key
```

**Usage:**
```javascript
const { sendMultiChannelNotification } = require('./utils/messaging');

const result = await sendMultiChannelNotification(
    'patient@example.com',
    '919876543210',
    'John Doe',
    'Dr. Smith',
    '2026-03-10',
    '10:00 AM',
    'https://mindvista.com/video/abc123?role=patient'
);

console.log('WhatsApp:', result.whatsapp.success);
console.log('SMS:', result.sms.success);
```

**Features:**
- ✅ WhatsApp URL generation (no API needed)
- ✅ Multiple SMS provider support
- ✅ Automatic provider detection
- ✅ Graceful fallback if not configured
- ✅ Phone number formatting
- ✅ Error handling

---

### `videoCall.js` - Video Call Link Generation
Generates unique video call links for appointments.

**Functions:**
- `generateVideoCallLink()` - Create unique video call room

**Usage:**
```javascript
const { generateVideoCallLink } = require('./utils/videoCall');

const result = generateVideoCallLink(
    appointmentId,
    doctorId,
    patientName
);

console.log(result.videoCallLink); // https://mindvista.com/video/abc123
console.log(result.videoCallId);   // abc123
```

---

### `multer.js` - File Upload Configuration
Configures Multer for handling file uploads (receipts, documents).

**Usage:**
```javascript
const upload = require('./utils/multer');

router.post('/upload', upload.single('receipt'), (req, res) => {
    // Handle file upload
});
```

---

## 🔄 Integration Flow

### Appointment Approval Flow:

```
1. Doctor approves appointment
         ↓
2. Generate video call link (videoCall.js)
         ↓
3. Update database
         ↓
4. Send notifications:
   ├─ Email (mailer.js) ✅
   ├─ WhatsApp (messaging.js) ✅
   └─ SMS (messaging.js) ✅
```

### Code Example:

```javascript
// In controller/appoiment.js

const { sendApprovalEmailWithVideoCall } = require('../utils/mailer');
const { generateVideoCallLink } = require('../utils/videoCall');
const { sendMultiChannelNotification } = require('../utils/messaging');

// Generate video call link
const videoCallResult = generateVideoCallLink(
    appointment._id,
    appointment.doctor._id,
    appointment.name
);

// Send email
await sendApprovalEmailWithVideoCall(
    appointment.email,
    appointment.name,
    doctorName,
    appointment.date,
    appointment.time,
    videoCallResult.videoCallLink
);

// Send WhatsApp & SMS
await sendMultiChannelNotification(
    appointment.email,
    appointment.phone,
    appointment.name,
    doctorName,
    appointment.date,
    appointment.time,
    videoCallResult.videoCallLink
);
```

---

## 🧪 Testing

### Test Email:
```bash
# Email functionality is tested in the main application
# Check EMAIL_SETUP.md for email configuration
```

### Test WhatsApp & SMS:
```bash
# Run the test script
node test-messaging.js
```

Expected output:
```
🧪 Testing Multi-Channel Messaging System

📱 Test 1: WhatsApp Message Generation
✅ WhatsApp test PASSED
📱 WhatsApp URL: https://wa.me/919876543210?text=...

📲 Test 2: SMS Sending
✅ SMS test PASSED (or ⚠️ SKIPPED if not configured)

🔔 Test 3: Multi-Channel Notification
📊 Multi-Channel Results:
   WhatsApp: ✅ Success
   SMS: ✅ Success (or ⚠️ Skipped)
```

---

## 🔧 Configuration

### Required (Already Working):
- `EMAIL_USER` - Gmail address
- `EMAIL_PASS` - Gmail app password

### Optional (For SMS):
Choose ONE SMS provider and configure in `.env`:
- Twilio (International)
- MSG91 (India)
- Fast2SMS (India)

See `MESSAGING_SETUP.md` for detailed configuration instructions.

---

## 📊 Feature Matrix

| Feature | File | Status | Configuration Required |
|---------|------|--------|----------------------|
| Email | `mailer.js` | ✅ Active | Yes (Gmail) |
| WhatsApp URL | `messaging.js` | ✅ Active | No |
| WhatsApp Auto | `messaging.js` | ⚠️ Optional | Yes (Twilio) |
| SMS | `messaging.js` | ⚠️ Optional | Yes (Provider) |
| Video Calls | `videoCall.js` | ✅ Active | No |
| File Upload | `multer.js` | ✅ Active | No |

---

## 🆘 Troubleshooting

### Email Issues:
- Check `EMAIL_SETUP.md`
- Verify Gmail app password
- Check console logs

### WhatsApp Issues:
- WhatsApp URL should always generate
- Check phone number format
- Test URL manually in browser

### SMS Issues:
- Verify provider credentials in `.env`
- Check provider dashboard for errors
- Ensure account has credits
- Check console logs for specific error

### General Issues:
- Check all environment variables are set
- Restart server after `.env` changes
- Check console logs for detailed errors
- Run `node test-messaging.js` to test

---

## 📚 Documentation

- **Email Setup**: `../EMAIL_SETUP.md`
- **Messaging Setup**: `../MESSAGING_SETUP.md`
- **Quick Summary**: `../MULTI_CHANNEL_SUMMARY.md`
- **Integration Checklist**: `../INTEGRATION_CHECKLIST.md`

---

## 🔒 Security Notes

1. **Never commit `.env` file** to version control
2. **Use environment variables** for all API keys
3. **Rotate API keys** regularly
4. **Validate phone numbers** before sending
5. **Use HTTPS** for all API endpoints
6. **Monitor usage** to detect unauthorized access

---

## 📝 Adding New Utilities

When adding new utility functions:

1. Create new file in `utils/` directory
2. Export functions using `module.exports`
3. Add configuration to `.env.example`
4. Document in this README
5. Add tests if applicable
6. Update integration checklist

Example:
```javascript
// utils/newUtility.js

const newFunction = async (param1, param2) => {
    try {
        // Implementation
        return { success: true, data: result };
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    newFunction
};
```

---

## ✅ Summary

The `utils/` directory provides:
- ✅ Email notifications (working)
- ✅ WhatsApp URL generation (working)
- ✅ SMS notifications (optional)
- ✅ Video call link generation (working)
- ✅ File upload handling (working)

All utilities are production-ready and fully documented. 🚀
