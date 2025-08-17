# Email Setup for MindVista Backend

## Required Environment Variables

To enable email notifications when appointments are approved/declined, you need to set up the following environment variables in your `.env` file:

```bash
# Email Configuration (for nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Backend URL (for internal API calls)
BACKEND_URL=http://localhost:5000
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASS`

## Alternative Email Services

You can modify the `service` field in `controller/refifyUser.js` to use other email services:

- **Outlook/Hotmail**: `service: 'outlook'`
- **Yahoo**: `service: 'yahoo'`
- **Custom SMTP**: Use `host`, `port`, `secure` instead of `service`

## Testing Email Functionality

1. Start your backend server
2. Create a test appointment through the registration form
3. Approve/decline the appointment as a doctor
4. Check the patient's email for the notification

## Troubleshooting

- **Authentication failed**: Check your email and app password
- **Connection timeout**: Verify your internet connection and firewall settings
- **Email not received**: Check spam folder and email address accuracy

## Security Notes

- Never commit your `.env` file to version control
- Use app passwords instead of your main password
- Consider using environment-specific configurations for production



