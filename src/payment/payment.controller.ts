import expressAsyncHandler from "express-async-handler";
import asyncHandler from "express-async-handler";
import * as paymentService from "./payment.service";
import Payment from "./payment.schema";
import { createResponse } from "../common/helper/response.helper";
import { Request, Response } from "express";

/**
 * Controller to create a Razorpay payment order
 * Expects: { amount: number, customerName: string, customerEmail: string, customerPhone: string }
 * Returns: Razorpay order details for client-side integration
 */
export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const { amount, customerName, customerEmail, customerPhone } = req.body;

  if (!amount || !customerName || !customerEmail || !customerPhone) {
    res.status(400).json(createResponse(null, "Missing required fields"));
    return;
  }

  if (!req.user || !req.user._id) {
    res.status(401).json(createResponse(null, "Unauthorized"));
    return;
  }

  const result = await paymentService.createPaymentService(
    amount,
    customerName,
    customerEmail,
    customerPhone,
    req.user._id
  );

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.message,
      error: result.error || 'Unknown error occurred'
    });
    return;
  }

  // Return the payment URL and details to the client
  if (!result.payment) {
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: 'Payment details not available'
    });
    return;
  }

  res.json({
    success: true,
    data: {
      paymentId: result.payment.paymentId,
      orderId: result.payment.orderId,
      amount: result.payment.amount,
      currency: result.payment.currency,
      paymentStatus: result.payment.paymentStatus,
      paymentUrl: result.payment.paymentUrl,
      receipt: result.payment.receipt,
      createdAt: result.payment.createdAt
    },
    message: result.message || 'Payment initiated successfully'
  });
});

/**
 * Webhook/Endpoint to verify payment signature and update payment status
 * This should be called after successful payment on the client side
 */
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, paymentId, signature } = req.body;

  if (!orderId || !paymentId || !signature) {
    res.status(400).json(createResponse(null, "Missing required parameters"));
    return;
  }

  const result = await paymentService.verifyPayment(orderId, paymentId, signature);
  
  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.message,
      error: result.error || 'Unknown error occurred'
    });
    return;
  }

  res.json(createResponse(result.payment, "Payment verified successfully"));
});

/**
 * List all payments for the authenticated user
 */
export const listPayments = expressAsyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    res.status(401).json(createResponse(null, "Unauthorized"));
    return;
  }
  
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(createResponse(payments, "Payments fetched successfully"));
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json(createResponse(null, "Error fetching payments"));
  }
});

/**
 * Get payment details by ID
 */
export const getPaymentDetails = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.user || !req.user._id) {
    res.status(401).json(createResponse(null, "Unauthorized"));
    return;
  }

  try {
    const payment = await Payment.findOne({ _id: id, user: req.user._id });
    if (!payment) {
      res.status(404).json(createResponse(null, "Payment not found"));
      return;
    }
    res.json(createResponse(payment, "Payment details fetched successfully"));
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json(createResponse(null, "Error fetching payment details"));
  }
});
