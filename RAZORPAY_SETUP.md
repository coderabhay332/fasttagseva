# Razorpay Integration Setup Guide

## Environment Variables Required

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGODB_URI=your_mongodb_connection_string_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_test_key_id_here
RAZORPAY_KEY_SECRET=your_test_key_secret_here

# For production, use live keys:
# RAZORPAY_KEY_ID=rzp_live_your_live_key_id_here
# RAZORPAY_KEY_SECRET=your_live_key_secret_here
```

## Getting Razorpay Keys

1. Sign up/login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Generate a new key pair
4. Copy the Key ID and Key Secret to your `.env` file

## Testing the Integration

1. Start your backend server:
   ```bash
   npm run start
   ```

2. Use the provided `razorpay-integration-example.html` file to test the integration
3. Replace `YOUR_JWT_TOKEN_HERE` in the HTML file with a valid JWT token
4. Open the HTML file in a browser and test the payment flow

## API Endpoints

### Create Payment
- **POST** `/api/payments/create`
- **Body:**
  ```json
  {
    "amount": 100,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "9876543210"
  }
  ```

### Verify Payment
- **POST** `/api/payments/verify`
- **Body:**
  ```json
  {
    "orderId": "order_id_from_razorpay",
    "paymentId": "payment_id_from_razorpay",
    "signature": "signature_from_razorpay"
  }
  ```

## Frontend Integration

The backend now returns both:
1. `paymentUrl` - Direct URL to Razorpay checkout (fixed)
2. `razorpayOrder` - Order details for JavaScript SDK integration

For better user experience, use the JavaScript SDK approach shown in the example HTML file.

## Common Issues and Solutions

### Issue: Empty page when accessing payment URL
**Solution:** Fixed by changing `payment_id` parameter to `order_id` and adding the `key` parameter.

### Issue: Payment not being captured
**Solution:** Ensure `payment_capture: true` is set in the order creation (already implemented).

### Issue: Signature verification failing
**Solution:** Make sure you're using the correct key secret and the signature is generated correctly.

## Security Notes

1. Never expose your Razorpay Key Secret in frontend code
2. Always verify payment signatures on the backend
3. Use test keys for development and live keys for production
4. Implement proper error handling and logging
