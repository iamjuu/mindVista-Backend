// routes/formRoutes.js
const express = require('express');
const router = express.Router();
const DashboardController = require('../controller/dashboard');

// routes/formRoutes.js
router.get('/dashboard', DashboardController.userList); // Fix spelling here
module.exports = router;

