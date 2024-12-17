const express = require('express');
const cors = require('cors');
const formRoutes = require('./router/registerRoute'); 
const SignupRouter = require('./router/signupRouter')
const LoginRouter = require('./router/loginRouter')
const bodyParser = require('body-parser');
require('dotenv').config();  // Make sure to load environment variables

const app = express();
const PORT = process.env.PORT || 3000;
const DatabaseConnetion = require('./config/databaseConnection')
DatabaseConnetion()
const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use('/', formRoutes);
app.use('/',SignupRouter)
app.use('/',LoginRouter)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

