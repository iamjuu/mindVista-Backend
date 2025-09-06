# Mailer Utility

This utility provides email functionality for the MindVista Psychology application.

## Functions

### `sendApprovalEmail(patientEmail, patientName, doctorName, appointmentDate, appointmentTime)`
Sends an approval email to a patient when their appointment is confirmed.

**Parameters:**
- `patientEmail` (string): Patient's email address
- `patientName` (string): Patient's full name
- `doctorName` (string): Doctor's full name
- `appointmentDate` (string): Appointment date
- `appointmentTime` (string): Appointment time

**Returns:** Promise that resolves to `{ success: boolean, messageId?: string, error?: string }`

### `sendDeclineEmail(patientEmail, patientName, doctorName, appointmentDate, appointmentTime, reason?)`
Sends a decline email to a patient when their appointment request cannot be accommodated.

**Parameters:**
- `patientEmail` (string): Patient's email address
- `patientName` (string): Patient's full name
- `doctorName` (string): Doctor's full name
- `appointmentDate` (string): Appointment date
- `appointmentTime` (string): Appointment time
- `reason` (string, optional): Reason for declining the appointment

**Returns:** Promise that resolves to `{ success: boolean, messageId?: string, error?: string }`

### `sendDoctorApprovalEmail(doctorEmail, doctorName)`
Sends a welcome email to a doctor when their account is approved.

**Parameters:**
- `doctorEmail` (string): Doctor's email address
- `doctorName` (string): Doctor's full name

**Returns:** Promise that resolves to `{ success: boolean, messageId?: string, error?: string }`

## Usage Examples

### In a controller:
```javascript
const { sendDoctorApprovalEmail } = require('../utils/mailer');

// Send approval email
try {
    const emailResult = await sendDoctorApprovalEmail(doctor.email, doctor.name);
    if (emailResult.success) {
        console.log('Email sent successfully:', emailResult.messageId);
    } else {
        console.error('Email failed:', emailResult.error);
    }
} catch (error) {
    console.error('Error sending email:', error);
}
```

### Direct function call:
```javascript
const { sendApprovalEmail } = require('../utils/mailer');

// Send appointment approval email
await sendApprovalEmail(
    'patient@example.com',
    'John Doe',
    'Dr. Smith',
    '2024-01-15',
    '10:00 AM'
);
```

## Configuration

The mailer uses environment variables for configuration:
- `EMAIL_USER`: Gmail account email address
- `EMAIL_PASS`: Gmail app password or account password

If environment variables are not set, it falls back to hardcoded values (not recommended for production).

## Error Handling

All functions return a result object with:
- `success`: Boolean indicating if the email was sent successfully
- `messageId`: Email message ID if successful
- `error`: Error message if failed

The functions handle errors gracefully and won't throw exceptions, making them safe to use in controllers without try-catch blocks.
