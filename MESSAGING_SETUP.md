# Multi-Channel Messaging Setup Guide

This guide explains how to set up Email, WhatsApp, and SMS notifications for appointment approvals in MindVista Psychology.

## 📋 Overview

When a doctor approves an appointment, the patient receives the video call link through **three channels**:

1. ✅ **Email** - Professional email with full appointment details
2. ✅ **WhatsApp** - Instant message with video call link
3. ✅ **SMS** - Text message with appointment confirmation

## 🚀 Features

- **Multi-channel delivery** ensures patients receive notifications even if one channel fails
- **Automatic fallback** - if SMS provider is not configured, the system continues without failing
- **Flexible configuration** - choose which SMS provider works best for your region
- **Existing functionality preserved** - all current email features remain unchanged

## 📧 Email Configuration (Already Working)

Email notifications are already configured using Nodemailer with Gmail. No changes needed.

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 📱 WhatsApp Configuration

### Option 1: Manual WhatsApp (No Setup Required)

The system automatically generates a WhatsApp URL that can be used to send messages. No API configuration needed!

**How it works:**
- System generates a `wa.me` link with pre-filled message
- Link can be shared with patient or opened to send message
- Works instantly without any API setup

### Option 2: Automated WhatsApp via Twilio (Optional)

For fully automated WhatsApp messages, configure Twilio:

1. **Sign up for Twilio**: https://www.twilio.com/
2. **Get WhatsApp Sandbox** or **WhatsApp Business API**
3. **Add to `.env`:**

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

4. **Uncomment Twilio code** in `utils/messaging.js` (lines marked with comments)

## 📲 SMS Configuration

Choose **ONE** SMS provider based on your location and preference:

### Option 1: Twilio (Recommended for International)

**Best for:** Global coverage, reliable delivery

1. **Sign up**: https://www.twilio.com/
2. **Get phone number** from Twilio console
3. **Add to `.env`:**

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Pricing:** ~$0.0075 per SMS (varies by country)

### Option 2: MSG91 (Recommended for India)

**Best for:** Indian phone numbers, cost-effective

1. **Sign up**: https://msg91.com/
2. **Get Auth Key** from dashboard
3. **Register Sender ID** (e.g., "MINDVS")
4. **Add to `.env`:**

```env
MSG91_AUTH_KEY=your_auth_key_here
MSG91_SENDER_ID=MINDVS
```

**Pricing:** ~₹0.15-0.25 per SMS

### Option 3: Fast2SMS (Alternative for India)

**Best for:** Quick setup in India

1. **Sign up**: https://www.fast2sms.com/
2. **Get API Key** from dashboard
3. **Add to `.env`:**

```env
FAST2SMS_API_KEY=your_api_key_here
FAST2SMS_SENDER_ID=TXTIND
```

**Pricing:** ~₹0.15-0.20 per SMS

## 🔧 Installation Steps

### Step 1: Install Dependencies (Already Done)

All required packages are already in `package.json`:
- `nodemailer` - Email
- `axios` - HTTP requests for SMS APIs

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env` (if not already done)
2. Add your SMS provider credentials (choose one from above)
3. Keep existing email configuration

```bash
cp .env.example .env
# Edit .env with your credentials
```

### Step 3: Test the System

1. **Start the backend:**
```bash
npm start
```

2. **Approve an appointment** through the doctor dashboard

3. **Check console logs** for notification status:
```
✅ Appointment approval email sent
✅ WhatsApp link generated: https://wa.me/919876543210?text=...
✅ SMS sent via Twilio: SMxxxxxxxxx
```

## 📊 How It Works

### Appointment Approval Flow

```
Doctor Approves Appointment
         ↓
Generate Video Call Link
         ↓
    ┌────┴────┬────────┬────────┐
    ↓         ↓        ↓        ↓
  Email   WhatsApp   SMS    Database
    ↓         ↓        ↓        ↓
 Patient  Patient  Patient  Updated
```

### Code Flow

1. **Doctor clicks "Approve"** in `AppointmentsTab.jsx`
2. **Frontend calls** `PUT /appointment/:id/approve`
3. **Backend** (`controller/appoiment.js`):
   - Generates video call link
   - Updates appointment status to "approved"
   - Sends email via `sendApprovalEmailWithVideoCall()`
   - Sends WhatsApp & SMS via `sendMultiChannelNotification()`
4. **Patient receives** notifications on all channels

## 🔍 Troubleshooting

### Email Not Sending

**Problem:** Email fails to send

**Solutions:**
- Check `EMAIL_USER` and `EMAIL_PASS` in `.env`
- Enable "Less secure app access" or use App Password for Gmail
- Check console logs for specific error

### WhatsApp Link Not Working

**Problem:** WhatsApp URL doesn't open

**Solutions:**
- Verify phone number format (should include country code)
- Test URL manually: `https://wa.me/919876543210`
- Check if WhatsApp is installed on device

### SMS Not Sending

**Problem:** SMS provider returns error

**Solutions:**

**For Twilio:**
- Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
- Check phone number format: `+919876543210`
- Verify Twilio account has credits
- Check Twilio console for error details

**For MSG91:**
- Verify `MSG91_AUTH_KEY` is correct
- Check if Sender ID is approved
- Ensure phone number is in correct format (without +)
- Verify account has credits

**For Fast2SMS:**
- Verify `FAST2SMS_API_KEY` is correct
- Check if API key has SMS permissions
- Verify account has credits

### No SMS Provider Configured

**Problem:** Console shows "No SMS provider configured"

**Solution:**
- This is just a warning, not an error
- Add at least one SMS provider to `.env`
- System will continue working with Email and WhatsApp only

## 📱 Message Templates

### Email Template
- Professional HTML email
- Full appointment details
- Video call button
- Security notice
- Branding

### WhatsApp Template
```
Hello [Patient Name]!

🎉 Your appointment with Dr. [Doctor Name] has been approved!

📅 Date: [Date]
⏰ Time: [Time]

🎥 Join your video consultation:
[Video Call Link]

Please join 5-10 minutes before your scheduled time.

Thank you,
MindVista Psychology
```

### SMS Template
```
MindVista: Your appointment with Dr. [Doctor] on [Date] at [Time] is approved! Video link: [Link]
```

## 🔐 Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use environment variables** for all API keys
3. **Rotate API keys** regularly
4. **Monitor usage** to detect unauthorized access
5. **Use HTTPS** for all API endpoints
6. **Validate phone numbers** before sending

## 💰 Cost Estimates

### Monthly Cost (100 appointments/month)

| Channel | Cost per Message | Monthly Cost |
|---------|-----------------|--------------|
| Email | Free (Gmail) | $0 |
| WhatsApp (Manual) | Free | $0 |
| WhatsApp (Twilio) | ~$0.005 | ~$0.50 |
| SMS (Twilio) | ~$0.0075 | ~$0.75 |
| SMS (MSG91) | ~₹0.20 | ~₹20 |
| SMS (Fast2SMS) | ~₹0.18 | ~₹18 |

**Total Monthly Cost:** ~$1-2 USD or ~₹20-40 INR

## 📝 Testing Checklist

- [ ] Email sends successfully
- [ ] WhatsApp link generates correctly
- [ ] SMS sends via configured provider
- [ ] Patient receives all three notifications
- [ ] Video call link works in all messages
- [ ] Phone number formatting is correct
- [ ] Error handling works (if provider fails)
- [ ] Console logs show clear status messages

## 🆘 Support

If you encounter issues:

1. Check console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test each provider individually
4. Check provider dashboards for error details
5. Ensure phone numbers are in correct format

## 📚 Additional Resources

- [Twilio Documentation](https://www.twilio.com/docs)
- [MSG91 Documentation](https://docs.msg91.com/)
- [Fast2SMS Documentation](https://docs.fast2sms.com/)
- [Nodemailer Documentation](https://nodemailer.com/)

## ✅ Summary

The multi-channel notification system is now fully integrated! When a doctor approves an appointment:

1. ✅ **Email** is sent with full details and video link
2. ✅ **WhatsApp** link is generated (or message sent if Twilio configured)
3. ✅ **SMS** is sent via your chosen provider (if configured)
4. ✅ **All existing functionality** remains unchanged
5. ✅ **System continues working** even if SMS/WhatsApp fails

No changes needed to frontend - everything works automatically! 🎉
