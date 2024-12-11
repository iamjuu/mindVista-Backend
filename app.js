const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const formRoutes = require('./router/registerRoute'); 
const SignupRouter = require('./router/signupRouter')
const LoginRouter = require('./router/loginRouter')
const PaymentRouter = require('./router/paymentRouter')
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};


app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/', formRoutes);
app.use('/',SignupRouter)
app.use('/',LoginRouter)
app.use('/',PaymentRouter)

mongoose.connect('mongodb://localhost:27017/mindVista', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
