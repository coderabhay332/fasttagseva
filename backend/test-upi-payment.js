// Test script for UPI payment integration
// Run this with: node test-upi-payment.js

const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust based on your server
const TEST_PAYMENT_DATA = {
  amount: 100, // ₹100
  customerName: 'Test User',
  customerEmail: 'test@example.com',
  customerPhone: '+919876543210',
  applicationId: '507f1f77bcf86cd799439011', // Replace with a valid application ID
  bankName: 'Test Bank',
  paymentMethod: 'UPI' // This is the new UPI payment method
};

async function testUPIPayment() {
  try {
    console.log('🧪 Testing UPI Payment Integration...');
    console.log('📋 Test Data:', TEST_PAYMENT_DATA);
    
    // Note: You'll need to replace this with actual authentication
    // For now, this will test the validation logic
    const response = await axios.post(`${API_BASE_URL}/payments/create`, TEST_PAYMENT_DATA, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });
    
    console.log('✅ UPI Payment created successfully!');
    console.log('📊 Response:', response.data);
    
    if (response.data.data.paymentMethod === 'UPI') {
      console.log('🎉 UPI payment method correctly set!');
    } else {
      console.log('❌ Payment method not set to UPI');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Note: You need to authenticate first. Update the JWT token in the script.');
    }
  }
}

// Test different payment methods
async function testAllPaymentMethods() {
  const paymentMethods = ['CARD', 'NET_BANKING', 'UPI', 'WALLET'];
  
  console.log('🧪 Testing all payment methods...');
  
  for (const method of paymentMethods) {
    console.log(`\n📱 Testing ${method} payment method...`);
    
    try {
      const testData = { ...TEST_PAYMENT_DATA, paymentMethod: method };
      const response = await axios.post(`${API_BASE_URL}/payments/create`, testData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
        }
      });
      
      console.log(`✅ ${method} payment created successfully!`);
      console.log(`📊 Payment Method: ${response.data.data.paymentMethod}`);
      
    } catch (error) {
      console.log(`❌ ${method} payment failed:`, error.response?.data?.message || error.message);
    }
  }
}

// Run tests
console.log('🚀 Starting UPI Payment Integration Tests\n');

// Uncomment the test you want to run:
// testUPIPayment();
// testAllPaymentMethods();

console.log('💡 To run the tests:');
console.log('1. Start your server: npm start');
console.log('2. Get a valid JWT token from your authentication endpoint');
console.log('3. Update the JWT token in this script');
console.log('4. Run: node test-upi-payment.js');
console.log('\n📚 Supported Payment Methods:');
console.log('- CARD: Credit/Debit cards');
console.log('- NET_BANKING: Internet banking');
console.log('- UPI: Unified Payments Interface (NEW!)');
console.log('- WALLET: Digital wallets');
console.log('- EMI: Equated Monthly Installments');
console.log('- OTHER: Other payment methods');
