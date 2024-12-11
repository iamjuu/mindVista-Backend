const express = require('express');
const router = express.Router();
const SignupController = require('../controller/Signup');

router.post('/signup', SignupController.Signup);

module.exports = router;
