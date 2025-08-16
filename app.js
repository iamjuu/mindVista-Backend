const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
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

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type'],
};

// Middleware order is important - CORS first, then body parsing
app.use(cors(corsOptions))

// Only use bodyParser.json() for JSON requests
// Don't use bodyParser.urlencoded() as it can interfere with multer
app.use(bodyParser.json())

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/',NotificationRouter)
app.use('/',ProfileRouter)
app.use('/',AppoinmentRouter)
app.use('/',DoctorRouter)



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});

