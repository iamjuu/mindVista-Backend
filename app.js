const express = require('express');
const cors = require('cors');
const path = require('path');
const NotificationRouter = require('./router/notification')
const ProfileRouter = require('./router/profle')
const AppoinmentRouter = require ('./router/appoiment') 
const DoctorRouter = require('./router/doctor')
const RefifyUserRouter = require('./router/refifyUser')
const PaymentRouter = require('./router/payment')
const bodyParser = require('body-parser');
require('dotenv').config();  // Make sure to load environment variables

const app = express();
const PORT = process.env.PORT || 3000;
const DatabaseConnetion = require('./config/databaseConnection')
// Import models to ensure they are registered with Mongoose
require('./models/index')
DatabaseConnetion()

// Multer configuration is handled in individual routers

const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
app.use('/',RefifyUserRouter)
app.use('/api',PaymentRouter)


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});

