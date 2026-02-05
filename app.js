const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const formRoutes = require('./router/registerRoute');
const SignupRouter = require('./router/signupRouter');
const LoginRouter = require('./router/loginRouter');
const DashboardRouter = require('./router/DashboardRouter');
const DatabaseConnetion = require('./config/databaseConnection');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Connect DB
DatabaseConnetion();

// ✅ Allowed origins (LOCAL + VERCEL)
const allowedOrigins = [
  'http://localhost:5173',
  'https://mindvista.vercel.app' // 🔴 replace with your real Vercel domain
];

// ✅ CORS config
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
);

app.use(bodyParser.json());

// ✅ Routes
app.use('/', formRoutes);
app.use('/', SignupRouter);
app.use('/', LoginRouter);
app.use('/', DashboardRouter);

// ✅ Health check (important for Railway)
app.get('/', (req, res) => {
  res.send('MindVista backend running 🚀');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
