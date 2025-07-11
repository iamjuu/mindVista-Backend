const express = require('express');
const cors = require('cors');
const NotificationRouter = require('./router/notification')
const ProfileRouter = require('./router/profle')
const AppoinmentRouter = require ('./router/appoiment') 
const DoctorRouter = require('./router/doctor')
const bodyParser = require('body-parser');
require('dotenv').config();  // Make sure to load environment variables

const app = express();
const PORT = process.env.PORT || 3000;
const DatabaseConnetion = require('./config/databaseConnection')
DatabaseConnetion()
const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions))
app.use(bodyParser.json())

app.use('/',NotificationRouter)
app.use('/',ProfileRouter)
app.use('/',AppoinmentRouter)
app.use('/',DoctorRouter)

console.log('Routes registered:');
console.log('- Notification routes');
console.log('- Profile routes');
console.log('- Appointment routes');
console.log('- Doctor routes');

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available appointment endpoints:');
  console.log('- GET /appointment - Get all appointments');
  console.log('- POST /appointment - Create new appointment');
  console.log('- PUT /appointment/:id/approve - Approve appointment');
  console.log('- PUT /appointment/:id/decline - Decline appointment');
  console.log('Available doctor endpoints:');
  console.log('- GET /doctors - Get all available doctors');
  console.log('- GET /doctors/:id - Get doctor by ID');
  console.log('- POST /doctors - Create new doctor');
  console.log('- PUT /doctors/:id - Update doctor');
  console.log('- DELETE /doctors/:id - Delete doctor');
  console.log('- GET /doctors/specialization/:specialization - Get doctors by specialization');
  console.log('- GET /doctors/admin/all - Get all doctors for admin');
});

