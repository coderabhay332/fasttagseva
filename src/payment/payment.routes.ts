import { Router } from "express";
import express from "express";
import * as paymentController from "./payment.controller";
import * as paymentWebhook from "./payment.webhook";
import { roleAuth } from "../common/middleware/role-auth.middleware";
import bodyParser from "body-parser";

const router = Router();
const paymentWebhookRouter = Router();

// Test Razorpay configuration (no authentication required)
router.get("/test-config", paymentController.testRazorpayConfig);

// Check order status (no authentication required)
router.get("/order-status/:orderId", paymentController.checkOrderStatus);

// Create payment (requires authentication)
router.post("/create", roleAuth(["USER", "ADMIN"]), paymentController.createPayment);

// Removed explicit verify routes in favor of webhooks

// Webhook endpoint for Razorpay (no authentication required)
// Use raw body to compute signature
paymentWebhookRouter.post("/webhook", bodyParser.raw({ type: "application/json" }),paymentWebhook.verifyWebhook);

// List payments (requires authentication)
router.get("/list", roleAuth(["USER", "ADMIN"]), paymentController.listPayments);

// Get payments by application ID (for admin panel)
router.get("/application/:applicationId", roleAuth(["ADMIN"]), paymentController.getPaymentsByApplication);

// Get payment details (requires authentication)
router.get("/:id", roleAuth(["USER", "ADMIN"]), paymentController.getPaymentDetails);

export { router, paymentWebhookRouter };