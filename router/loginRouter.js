// routes/formRoutes.js
const express = require('express');
const router = express.Router();
const LoginController = require('../controller/login');

router.post('/login', LoginController.Login);

module.exports = router;

