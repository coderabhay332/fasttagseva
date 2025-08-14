import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "./payment.schema";
import userSchema from "../user/user.schema";

// Define Razorpay order interface
interface RazorpayOrder {
  id: string;
  amount: number;
  amount_paid: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

export const createPaymentService = async (
  amount: number,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  userId: string
) => {
  try {
    // Convert amount to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(amount * 100);
    const receiptId = `order_${Date.now()}`;

    // Create Razorpay order
    const orderResponse = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      payment_capture: true, // Auto capture payment
      notes: {
        customerName,
        customerEmail,
        customerPhone,
        userId: userId.toString()
      }
    });
    
    // Type assertion for Razorpay order response
    const order = orderResponse as RazorpayOrder;

    // Generate payment URL
    const paymentLink = `https://checkout.razorpay.com/v1/checkout.html?payment_id=${order.id}`;
    
    // Save payment to DB
    const paymentDoc = await Payment.create({
      orderId: order.id,
      amount: amount,
      currency: order.currency || "INR",
      customerName,
      customerEmail,
      customerPhone,
      paymentStatus: "CREATED",
      paymentLink: paymentLink,
      paymentSessionId: order.receipt,
      response: order,
      user: userId,
    });

    // Add payment reference to user
    await userSchema.findByIdAndUpdate(
      userId,
      { $push: { payments: paymentDoc._id } },
      { new: true }
    );

    // Return the payment URL and order details
    return {
      success: true,
      payment: {
        paymentId: paymentDoc._id,
        orderId: order.id,
        amount: amount,
        currency: order.currency || "INR",
        paymentStatus: "CREATED",
        paymentUrl: paymentLink,
        receipt: order.receipt,
        createdAt: new Date()
      },
      message: "Payment initiated successfully. Please complete the payment using the provided URL."
    };
  } catch (error: unknown) {
    console.error("Razorpay payment error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDescription = error && typeof error === 'object' && 'error' in error 
      ? (error as any).error?.description 
      : undefined;
      
    return {
      success: false,
      message: "Failed to create payment order",
      error: errorDescription || errorMessage,
    };
  }
};

// Add this function to verify payment signature and update payment status
export const verifyPayment = async (orderId: string, paymentId: string, signature: string) => {
  try {
    // Verify the payment signature
    const text = orderId + "|" + paymentId;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(text)
      .digest('hex');

    if (generatedSignature !== signature) {
      return {
        success: false,
        message: 'Payment verification failed: Invalid signature'
      };
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    
    // Update payment status in database
    const updateData: any = {
      paymentStatus: payment.status === 'captured' ? 'PAID' : 'FAILED',
      paymentId: payment.id,
      paymentDate: new Date(payment.created_at * 1000), // Convert from seconds to milliseconds
      'response.payment': payment
    };

    if (payment.status === 'captured') {
      updateData.paymentStatus = 'PAID';
    } else if (payment.status === 'failed') {
      updateData.paymentStatus = 'FAILED';
    }

    const updatedPayment = await Payment.findOneAndUpdate(
      { orderId },
      updateData,
      { new: true }
    );

    if (!updatedPayment) {
      return {
        success: false,
        message: 'Payment record not found'
      };
    }

    return {
      success: true,
      payment: updatedPayment,
      message: 'Payment verified and updated successfully'
    };
  } catch (error: unknown) {
    console.error('Error verifying payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: 'Error verifying payment',
      error: errorMessage
    };
  }
};