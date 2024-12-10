// routes/formRoutes.js
const express = require('express');
const router = express.Router();
const formController = require('../controller/register');

router.post('/register', formController.submitForm);

module.exports = router;
