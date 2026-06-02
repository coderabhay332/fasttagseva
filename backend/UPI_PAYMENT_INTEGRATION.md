# UPI Payment Integration Guide

This document explains how to use the newly added UPI payment support in your FastTag backend application.

## 🚀 What's New

Your Razorpay integration now supports **UPI (Unified Payments Interface)** payments along with the existing Card and Net Banking options.

## 📋 Supported Payment Methods

| Method | Description | Status |
|--------|-------------|--------|
| `CARD` | Credit/Debit Cards | ✅ Existing |
| `NET_BANKING` | Internet Banking | ✅ Existing |
| `UPI` | Unified Payments Interface | 🆕 **NEW** |
| `WALLET` | Digital Wallets | ✅ Available |
| `EMI` | Equated Monthly Installments | ✅ Available |
| `OTHER` | Other Payment Methods | ✅ Available |

## 🔧 API Changes

### Create Payment Endpoint

**Endpoint:** `POST /api/payments/create`

**New Request Body:**
```json
{
  "amount": 100,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+919876543210",
  "applicationId": "507f1f77bcf86cd799439011",
  "bankName": "HDFC Bank",
  "paymentMethod": "UPI"  // 🆕 NEW FIELD
}
```

**Payment Method Options:**
- `"CARD"` - Default, for credit/debit cards
- `"NET_BANKING"` - For internet banking
- `"UPI"` - For UPI payments (NEW!)
- `"WALLET"` - For digital wallets
- `"EMI"` - For EMI payments
- `"OTHER"` - For other payment methods

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "507f1f77bcf86cd799439011",
    "orderId": "order_ABC123",
    "amount": 100,
    "currency": "INR",
    "paymentStatus": "created",
    "paymentUrl": "https://rzp.io/l/xyz123",
    "paymentMethod": "UPI",  // 🆕 NEW FIELD
    "receipt": "pl_1234567890",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Payment link created successfully"
}
```

## 🎯 UPI Payment Features

### 1. UPI Intent Flow
When `paymentMethod` is set to `"UPI"`, the payment link will:
- Prioritize UPI as the primary payment method
- Show UPI apps prominently in the checkout
- Support UPI ID, QR code, and app-based payments

### 2. UPI Apps Supported
- Google Pay
- PhonePe
- Paytm
- BHIM
- Amazon Pay
- And 200+ other UPI apps

### 3. UPI Payment Flow
1. User clicks payment link
2. Razorpay checkout opens with UPI as primary option
3. User selects their UPI app
4. Payment is processed through UPI
5. User receives confirmation

## 💻 Frontend Integration

### Example Frontend Code

```javascript
// Create UPI payment
const createUPIPayment = async (paymentData) => {
  try {
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        ...paymentData,
        paymentMethod: 'UPI'  // Set UPI as payment method
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Redirect to Razorpay payment page
      window.open(result.data.paymentUrl, '_blank');
    }
  } catch (error) {
    console.error('Payment creation failed:', error);
  }
};

// Payment method selection UI
const PaymentMethodSelector = () => {
  const [selectedMethod, setSelectedMethod] = useState('CARD');
  
  const paymentMethods = [
    { value: 'CARD', label: '💳 Credit/Debit Card', icon: '💳' },
    { value: 'NET_BANKING', label: '🏦 Net Banking', icon: '🏦' },
    { value: 'UPI', label: '📱 UPI Payment', icon: '📱' },
    { value: 'WALLET', label: '💰 Digital Wallet', icon: '💰' }
  ];
  
  return (
    <div className="payment-methods">
      {paymentMethods.map(method => (
        <button
          key={method.value}
          className={`payment-method ${selectedMethod === method.value ? 'selected' : ''}`}
          onClick={() => setSelectedMethod(method.value)}
        >
          <span className="icon">{method.icon}</span>
          <span className="label">{method.label}</span>
        </button>
      ))}
    </div>
  );
};
```

## 🧪 Testing

### Test UPI Payments

1. **Use Test Credentials:**
   - Ensure you're using Razorpay test mode
   - Test UPI ID: `success@razorpay`
   - Test UPI PIN: `1234`

2. **Test Different Scenarios:**
   ```bash
   # Test UPI payment
   curl -X POST http://localhost:5000/api/payments/create \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "amount": 100,
       "customerName": "Test User",
       "customerEmail": "test@example.com",
       "customerPhone": "+919876543210",
       "applicationId": "507f1f77bcf86cd799439011",
       "bankName": "Test Bank",
       "paymentMethod": "UPI"
     }'
   ```

3. **Run Test Script:**
   ```bash
   node test-upi-payment.js
   ```

## 🔍 Database Changes

### Payment Schema Updates

The `Payment` model now includes a `paymentMethod` field:

```javascript
{
  // ... existing fields
  paymentMethod: { 
    type: String, 
    enum: ["CARD", "NET_BANKING", "UPI", "WALLET", "EMI", "OTHER"],
    default: "CARD" 
  }
}
```

### Query Payments by Method

```javascript
// Get all UPI payments
const upiPayments = await Payment.find({ paymentMethod: 'UPI' });

// Get payments by method
const paymentsByMethod = await Payment.aggregate([
  { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
]);
```

## 🚨 Important Notes

### 1. Razorpay Configuration
- UPI is enabled by default in Razorpay Payment Links
- No additional configuration needed in Razorpay dashboard
- UPI payments are available in both test and live modes

### 2. UPI Payment Limits
- Minimum amount: ₹1
- Maximum amount: ₹1,00,000 per transaction
- Daily limit: ₹1,00,000 (varies by bank)

### 3. Error Handling
- Invalid payment method returns 400 error
- UPI payment failures are handled by Razorpay
- Check payment status via webhook or API

### 4. Security
- UPI payments are secured by UPI PIN
- No sensitive data stored in your database
- All payment processing handled by Razorpay

## 📞 Support

For issues related to:
- **UPI Integration**: Check Razorpay documentation
- **API Errors**: Check server logs
- **Payment Failures**: Check Razorpay dashboard

## 🎉 Success!

Your FastTag application now supports UPI payments! Users can pay using their preferred UPI app directly from the payment link.

---

**Next Steps:**
1. Update your frontend to include UPI payment option
2. Test the integration thoroughly
3. Deploy to production
4. Monitor UPI payment success rates
