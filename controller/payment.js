// controllers/paymentController.js

const axios = require('axios');
const crypto = require('crypto');
const { PAYTM_MID, PAYTM_KEY, PAYTM_WEBSITE } = require('../config');

// Helper function to generate checksum
function generateChecksum(params, key) {
  const body = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('|');
  
  const hash = crypto
    .createHash('sha256')
    .update(body + `|${key}`)
    .digest('hex');
  
  return hash;
}
const generateOrder = async (req, res) => {
  const { amount, email, number } = req.body;

  const orderId = `ORD${new Date().getTime()}`;

  const txnData = {
    MID: PAYTM_MID,
    WEBSITE: PAYTM_WEBSITE,
    CHANNEL_ID: 'WEB',
    INDUSTRY_TYPE_ID: 'Retail',
    ORDER_ID: orderId,
    CUST_ID: email, 
    TXN_AMOUNT: amount,
    EMAIL: email,
    MOBILE_NO: number,
    CALLBACK_URL: 'http://localhost:3000/callback',
  };

  const checksum = generateChecksum(txnData, PAYTM_KEY);

  txnData.CHECKSUMHASH = checksum;

  try {
    const response = await axios.post('https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction', txnData, {
      headers: { 'Content-Type': 'application/json' },
    });

    res.json({
      orderId: orderId,
      txnToken: response.data.txnToken,
    });
  } catch (error) {
    console.error('Error generating order:', error);
    res.status(500).json({ error: 'Failed to create order.' });
  }
};

const callback = (req, res) => {
  const { CHECKSUMHASH, ...responseData } = req.body;

  const checksum = generateChecksum(responseData, PAYTM_KEY);

  if (checksum === CHECKSUMHASH) {
    if (responseData.STATUS === 'TXN_SUCCESS') {
      res.send('Payment Successful');
    } else {
      res.send('Payment Failed');
    }
  } else {
    res.send('Checksum Mismatch');
  }
};

module.exports = {
  generateOrder,
  callback,
};
