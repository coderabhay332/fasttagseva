import expressAsyncHandler from "express-async-handler";
import asyncHandler from "express-async-handler";
import * as paymentService from "./payment.service";
import Payment from "./payment.schema";
import { createResponse } from "../common/helper/response.helper";
import { Request, Response } from "express";


export const testRazorpayConfig = asyncHandler(async (req: Request, res: Response) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    res.status(500).json({
      success: false,
      message: "Razorpay configuration is missing",
      error: "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not found"
    });
    return;
  }

  res.json({
    success: true,
    message: "Razorpay configuration is valid",
    data: {
      keyId: keyId.substring(0, 10) + "...", // Show only first 10 characters for security
      hasKeySecret: !!keySecret
    }
  });
});


export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const { amount, customerName, customerEmail, customerPhone, applicationId, bankName } = req.body;

  if (!amount || !customerName || !customerEmail || !customerPhone || !applicationId || !bankName) {
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
    req.user._id,
    applicationId,
    bankName
  );

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.message,
      error: result.error || 'Unknown error occurred'
    });
    return;
  }

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
      paymentUrl: result.payment.paymentUrl,  // ✅ Direct link for frontend
      receipt: result.payment.receipt,
      createdAt: result.payment.createdAt
    },
    message: result.message
  });
  
});

export const checkOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;

  if (!orderId) {
    res.status(400).json(createResponse(null, "Order ID is required"));
    return;
  }

  const result = await paymentService.checkOrderStatus(orderId);
  
  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.message,
      error: result.error || 'Unknown error occurred'
    });
    return;
  }

  res.json(createResponse(result.order, "Order status fetched successfully"));
});

/**
 * List all payments for the authenticated user
 */
export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    res.status(401).json(createResponse(null, "Unauthorized"));
    return;
  }

  // Extract pagination parameters from query
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const result = await paymentService.listPayments(req.user._id, page, limit);
  res.json(createResponse(result, "Payments fetched successfully"));
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

/**
 * Get payments by application ID (for admin panel)
 */
export const getPaymentsByApplication = asyncHandler(async (req: Request, res: Response) => {
  const { applicationId } = req.params;
  
  if (!applicationId) {
    res.status(400).json(createResponse(null, "Application ID is required"));
    return;
  }

  // Extract pagination parameters from query
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const result = await paymentService.getPaymentsByApplication(applicationId, page, limit);
  res.json(createResponse(result, "Application payments fetched successfully"));
});

/**
 * Razorpay Webhook handler (uses raw body to compute signature)
 * Header: x-razorpay-signature, Secret: process.env.RAZORPAY_WEBHOOK_SECRET (recommended)
 */
