import type { Context } from 'hono';
import type { Env } from '../types/env';

// Razorpay integration for Workers
// Note: Razorpay SDK doesn't work in Workers, we use their REST API

const RAZORPAY_API = 'https://api.razorpay.com/v1';

export const createPayment = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json();
    const { amount, customerName, customerEmail, customerPhone, applicationId, bankName, paymentMethod } = body;
    
    const amountInPaise = Math.round(amount * 100);
    const receiptId = `pl_${Date.now()}`;
    
    // Create auth header
    const auth = btoa(`${c.env.RAZORPAY_KEY_ID}:${c.env.RAZORPAY_KEY_SECRET}`);
    
    const paymentLinkOptions: any = {
      amount: amountInPaise,
      currency: 'INR',
      accept_partial: false,
      description: `Payment for ${customerName}`,
      customer: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone
      },
      notify: { sms: true, email: true },
      reminder_enable: true,
      notes: {
        userId: c.get('user')._id,
        customerName,
        customerEmail,
        customerPhone,
        paymentMethod,
        applicationId
      },
      callback_url: `${c.env.FRONTEND_BASE_URL}/upload-documents/${applicationId}`,
      callback_method: 'get'
    };
    
    // UPI configuration
    if (paymentMethod === 'UPI') {
      paymentLinkOptions.options = {
        checkout: { method: { upi: { flow: 'intent' } } }
      };
    }
    
    // Call Razorpay API
    const response = await fetch(`${RAZORPAY_API}/payment_links`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentLinkOptions)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.description || 'Razorpay API error');
    }
    
    const paymentLink = await response.json();
    
    // Store in database (using in-memory for now)
    // TODO: Replace with D1 or MongoDB Data API
    
    return c.json({
      success: true,
      payment: {
        orderId: paymentLink.id,
        amount,
        currency: 'INR',
        paymentStatus: paymentLink.status,
        paymentUrl: paymentLink.short_url,
        paymentMethod: paymentMethod.toUpperCase(),
        receipt: receiptId
      },
      message: 'Payment link created successfully'
    });
    
  } catch (error: any) {
    console.error('Create payment error:', error);
    return c.json({
      success: false,
      message: 'Failed to create payment link',
      error: error.message
    }, 500);
  }
};

export const webhook = async (c: Context<{ Bindings: Env }>) => {
  try {
    const signature = c.req.header('x-razorpay-signature');
    const rawBody = await c.req.text();
    
    if (!signature || !c.env.RAZORPAY_WEBHOOK_SECRET) {
      return c.json({ success: false, message: 'Missing signature or secret' }, 400);
    }
    
    // Verify signature using Web Crypto
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(c.env.RAZORPAY_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    if (expectedSignature !== signature) {
      return c.json({ success: false, message: 'Invalid signature' }, 400);
    }
    
    const event = JSON.parse(rawBody);
    const eventType = event.event;
    
    console.log('Webhook received:', eventType);
    
    // Process payment events
    // TODO: Update payment status in database
    
    return c.json({ success: true, message: 'Webhook processed' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ success: false, message: 'Webhook processing failed' }, 500);
  }
};

export const checkOrderStatus = async (c: Context<{ Bindings: Env }>) => {
  const orderId = c.req.param('orderId');
  
  try {
    const auth = btoa(`${c.env.RAZORPAY_KEY_ID}:${c.env.RAZORPAY_KEY_SECRET}`);
    
    const response = await fetch(`${RAZORPAY_API}/orders/${orderId}`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }
    
    const order = await response.json();
    
    return c.json({
      success: true,
      order,
      message: 'Order details fetched'
    });
    
  } catch (error: any) {
    return c.json({ success: false, message: 'Failed to fetch order', error: error.message }, 500);
  }
};

export const listPayments = async (c: Context<{ Bindings: Env }>) => {
  const user = c.get('user');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');
  
  // TODO: Fetch from database
  return c.json({
    success: true,
    payments: [],
    pagination: { currentPage: page, totalPages: 0, totalCount: 0, limit, hasNextPage: false, hasPrevPage: false },
    message: 'Payments fetched'
  });
};

export const getPaymentsByApplication = async (c: Context<{ Bindings: Env }>) => {
  const applicationId = c.req.param('applicationId');
  
  // TODO: Fetch from database
  return c.json({
    success: true,
    payments: [],
    message: 'Application payments fetched'
  });
};
