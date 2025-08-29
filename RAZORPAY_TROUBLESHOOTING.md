# Razorpay Empty Page Issue - Troubleshooting Guide

## Problem Description
You're getting a payment URL from your API, but when you access it, you see an empty page instead of the Razorpay checkout.

## Step-by-Step Troubleshooting

### 1. Test Your Configuration
First, test if your Razorpay configuration is working:

```bash
# Start your server
npm run start

# Test the configuration endpoint
curl http://localhost:5000/api/payments/test-config
```

### 2. Check the Generated URL
Compare your generated URL with this working format:

**Your URL:**
```
https://checkout.razorpay.com/v1/checkout.html?key=rzp_test_R5UgJ04op15U9a&order_id=order_R6gQLJmb5DbIpk&prefill[name]=John%20Doe&prefill[email]=john%40example.com&prefill[contact]=9876543210
```

**Expected Format:**
```
https://checkout.razorpay.com/v1/checkout.html?key=YOUR_KEY_ID&order_id=ORDER_ID
```

### 3. Common Issues and Solutions

#### Issue 1: Invalid Order ID
- **Symptom**: Empty page or error message
- **Solution**: Verify the order was created successfully in Razorpay dashboard

#### Issue 2: Wrong Key ID
- **Symptom**: Empty page
- **Solution**: Ensure you're using the correct key ID (test vs live)

#### Issue 3: Order Already Used
- **Symptom**: Empty page
- **Solution**: Each order can only be used once. Create a new order for each payment.

#### Issue 4: Invalid URL Parameters
- **Symptom**: Empty page
- **Solution**: Check if all parameters are properly encoded

### 4. Debug Steps

#### Step 1: Check Server Logs
Look for these log messages in your server console:
```
Creating Razorpay order with: { amount: 10000, currency: "INR", ... }
Razorpay order created: { id: "order_...", ... }
Generated payment URL: https://checkout.razorpay.com/...
```

#### Step 2: Test with Minimal URL
Try accessing this minimal URL format:
```
https://checkout.razorpay.com/v1/checkout.html?key=YOUR_KEY_ID&order_id=ORDER_ID
```

#### Step 3: Verify Order in Razorpay Dashboard
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to Orders
3. Check if your order exists and is in "created" status

### 5. Alternative Solutions

#### Solution 1: Use JavaScript SDK (Recommended)
Instead of direct URL, use Razorpay's JavaScript SDK:

```javascript
const options = {
  key: 'YOUR_KEY_ID',
  amount: 10000,
  currency: 'INR',
  order_id: 'ORDER_ID',
  handler: function (response) {
    // Handle success
  }
};
const rzp = new Razorpay(options);
rzp.open();
```

#### Solution 2: Check Razorpay Account Status
- Ensure your Razorpay account is active
- Check if you have sufficient balance (for live mode)
- Verify your account is not suspended

#### Solution 3: Test with Different Browser
- Try accessing the URL in incognito/private mode
- Test with different browsers
- Clear browser cache and cookies

### 6. Environment Variables Check
Ensure your `.env` file has:
```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### 7. Test with Provided HTML Files
Use the provided test files:
1. `test-razorpay.html` - For debugging URL issues
2. `razorpay-integration-example.html` - For full integration testing

### 8. Contact Razorpay Support
If none of the above works:
1. Check [Razorpay Documentation](https://razorpay.com/docs/)
2. Contact Razorpay support with your order ID
3. Provide them with the exact error you're seeing

## Quick Fix
If you need a quick fix, try this simplified URL format:

```javascript
// In your payment service, change the URL generation to:
const paymentLink = `https://checkout.razorpay.com/v1/checkout.html?key=${process.env.RAZORPAY_KEY_ID}&order_id=${order.id}`;
```

This removes all optional parameters and should work if the basic integration is correct.
