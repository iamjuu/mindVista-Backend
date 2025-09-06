# Razorpay Payment Integration Setup

## Backend Configuration

### 1. Install Dependencies
```bash
npm install razorpay
```

### 2. Environment Variables
Create a `.env` file in the backend root directory with:
```env
RAZORPAY_KEY_ID=rzp_test_R6TXpHwdckbvvZ
RAZORPAY_KEY_SECRET=CLOIqvgZbUfP86lysVma5Nzn
```

### 3. Payment Endpoints
The following endpoints are now available:

- `POST /api/create-order` - Create a new Razorpay order
- `POST /api/verify-payment` - Verify payment signature
- `GET /api/payment-details/:orderId` - Get payment details
- `POST /api/refund` - Process refund

### 4. Start Backend Server
```bash
npm start
```
Server runs on port 3000

## Frontend Configuration

### 1. Razorpay Key
The frontend is configured with the test key: `rzp_test_R6TXpHwdckbvvZ`

### 2. API Endpoints
Frontend calls backend at: `http://localhost:3000/api/`

### 3. Payment Flow
1. User fills registration form
2. Form submits to `/appointment` endpoint
3. User is redirected to `/payment` page
4. Payment page calls `/api/create-order` to create Razorpay order
5. Razorpay modal opens for payment
6. After payment, verification is done via `/api/verify-payment`

## Testing

### Test Card Details (Razorpay Test Mode)
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

### Test UPI
- UPI ID: success@razorpay

## Important Notes

1. **Test Mode**: Currently using Razorpay test keys
2. **Amount**: Fixed at ₹500 (50000 paise) for consultation
3. **Currency**: INR only
4. **CORS**: Backend configured to allow requests from `http://localhost:5173`

## Production Setup

1. Replace test keys with live Razorpay keys
2. Update environment variables
3. Change CORS origin to your production domain
4. Implement proper error handling and logging
5. Add payment status tracking in database
