# Dashboard API Documentation

This document describes the dashboard API endpoints for the MindVista application.

## Base URL
All dashboard endpoints are prefixed with: `/api/dashboard`

## Endpoints

### 1. Get Dashboard Statistics
**Endpoint:** `GET /api/dashboard/stats`

**Description:** Returns overall dashboard statistics including total counts for doctors, patients, appointments, and today's appointments.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDoctors": 5,
    "totalPatients": 150,
    "totalAppointments": 200,
    "completedAppointments": 180,
    "todayAppointments": 5
  }
}
```

---

### 2. Get All Doctors with Statistics
**Endpoint:** `GET /api/dashboard/doctors`

**Description:** Returns a list of all doctors with their individual statistics including total income, patient count, ratings, and monthly data.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dr. John Doe",
      "email": "john@example.com",
      "specialization": "Clinical Psychology",
      "experience": "10 years",
      "qualification": "PhD in Psychology",
      "profileImage": "/uploads/doctors/profile.jpg",
      "totalPatients": 156,
      "totalIncome": 145000,
      "avgRating": 4.5,
      "reviewCount": 120,
      "monthlyIncome": [
        { "name": "Jan", "income": 18000 },
        { "name": "Feb", "income": 20000 },
        ...
      ],
      "patientGrowth": [
        { "name": "Jan", "patients": 20 },
        { "name": "Feb", "patients": 25 },
        ...
      ]
    }
  ]
}
```

**Notes:**
- `monthlyIncome` contains data for the last 6 months
- `patientGrowth` shows new patients per month for the last 6 months
- Income values are calculated from completed appointments only

---

### 3. Get Specific Doctor Statistics
**Endpoint:** `GET /api/dashboard/doctors/:doctorId`

**Description:** Returns detailed statistics for a specific doctor.

**Parameters:**
- `doctorId` (URL parameter) - The ID of the doctor

**Response:**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": 1,
      "name": "Dr. John Doe",
      "specialization": "Clinical Psychology",
      "profileImage": "/uploads/doctors/profile.jpg"
    },
    "totalPatients": 156,
    "totalIncome": 145000,
    "avgRating": 4.5,
    "reviewCount": 120,
    "monthlyIncome": [...],
    "patientGrowth": [...]
  }
}
```

---

### 4. Get Recent Appointments
**Endpoint:** `GET /api/dashboard/appointments/recent`

**Description:** Returns the most recent appointments with doctor and patient information.

**Query Parameters:**
- `limit` (optional) - Number of appointments to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2025-10-15",
      "time": "10:00 AM",
      "status": "completed",
      "fees": 1000,
      "Doctor": {
        "id": 1,
        "name": "Dr. John Doe",
        "specialization": "Clinical Psychology",
        "profileImage": "/uploads/doctors/profile.jpg"
      },
      "Profile": {
        "id": 1,
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  ]
}
```

---

### 5. Get Financial Overview
**Endpoint:** `GET /api/dashboard/finance`

**Description:** Returns financial statistics including total revenue, today's revenue, and monthly revenue data.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 500000,
    "todayRevenue": 5000,
    "totalCompletedAppointments": 180,
    "monthlyRevenue": [
      { "name": "Jan", "revenue": 75000 },
      { "name": "Feb", "revenue": 80000 },
      ...
    ]
  }
}
```

**Notes:**
- `monthlyRevenue` contains data for the last 6 months
- Revenue is calculated only from completed appointments

---

### 6. Get Work Hour Analysis
**Endpoint:** `GET /api/dashboard/work-hours`

**Description:** Returns work hour analysis data (placeholder implementation).

**Response:**
```json
{
  "success": true,
  "data": {
    "totalHours": 38.2,
    "activeHours": 28.5,
    "pauseHours": 6.5,
    "extraHours": 3.2,
    "weeklyData": [
      { "day": "Mon", "hours": 8.5 },
      { "day": "Tue", "hours": 7.8 },
      ...
    ]
  }
}
```

**Notes:**
- This is a placeholder implementation
- Can be expanded based on actual work hour tracking system

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "Detailed error message (only in development)"
}
```

Common HTTP status codes:
- `200` - Success
- `404` - Resource not found
- `500` - Internal server error

---

## Implementation Notes

1. **Database Models Used:**
   - `Doctor` - Doctor information (MongoDB/Mongoose)
   - `Appointment` (model: `Appoiment`) - Appointment records
   - `Profile` - Patient/user profiles
   - `Review` - Doctor reviews and ratings (general, not doctor-specific)

2. **Field Names:**
   - Appointments use `amount` field for fees
   - Appointments use `paymentStatus: 'completed'` for completed payments
   - Appointments use `status: 'confirmed'` for confirmed appointments
   - Doctor profile picture is stored in `profilePicture` field
   - Appointments reference doctor via `doctor` field (ObjectId)

3. **Calculations:**
   - Total income is calculated from appointments with `paymentStatus: 'completed'`
   - Average ratings are calculated from all active reviews (general ratings)
   - Patient counts are based on total appointments per doctor
   - Dates are stored as strings and matched using regex

4. **Date Ranges:**
   - Monthly data (income, patient growth, revenue) covers the last 6 months
   - Today's data uses regex matching on date strings
   - Supports multiple date formats (YYYY-MM-DD, DD-MM-YYYY, etc.)

5. **Performance Considerations:**
   - Use appropriate MongoDB indexes on frequently queried fields
   - Consider caching for frequently accessed statistics
   - Implement pagination for large datasets
   - Uses `.lean()` for read-only queries to improve performance

---

## Frontend Integration

The dashboard frontend component (`mindVista-psychology-webApp/src/pages/admin/Dashboard/home/index.jsx`) automatically fetches data from these endpoints on component mount.

**API Client:**
```javascript
import apiInstance from "../../../../instance";

// Fetch doctors with stats
const response = await apiInstance.get('/api/dashboard/doctors');
```

**Key Features:**
- Automatic data fetching on component mount
- Loading states while fetching data
- Error handling for failed requests
- Dynamic background colors for doctor cards
- Interactive charts using recharts library

