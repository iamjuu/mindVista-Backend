
const express = require('express');
const router = express.Router();
const { generateOrder, callback } = require('../controller/payment');

router.post('/generateOrder', generateOrder);
router.post('/callback', callback);

module.exports = router;
