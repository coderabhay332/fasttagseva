"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentWebhookRouter = exports.router = void 0;
const express_1 = require("express");
const paymentController = __importStar(require("./payment.controller"));
const paymentWebhook = __importStar(require("./payment.webhook"));
const role_auth_middleware_1 = require("../common/middleware/role-auth.middleware");
const body_parser_1 = __importDefault(require("body-parser"));
const router = (0, express_1.Router)();
exports.router = router;
const paymentWebhookRouter = (0, express_1.Router)();
exports.paymentWebhookRouter = paymentWebhookRouter;
// Test Razorpay configuration (no authentication required)
router.get("/test-config", paymentController.testRazorpayConfig);
// Check order status (no authentication required)
router.get("/order-status/:orderId", paymentController.checkOrderStatus);
// Create payment (requires authentication)
router.post("/create", (0, role_auth_middleware_1.roleAuth)(["USER", "ADMIN"]), paymentController.createPayment);
// Removed explicit verify routes in favor of webhooks
// Webhook endpoint for Razorpay (no authentication required)
// Use raw body to compute signature
paymentWebhookRouter.post("/webhook", body_parser_1.default.raw({ type: "application/json" }), paymentWebhook.verifyWebhook);
// List payments (requires authentication)
router.get("/list", (0, role_auth_middleware_1.roleAuth)(["USER", "ADMIN"]), paymentController.listPayments);
// Get payments by application ID (for admin panel)
router.get("/application/:applicationId", (0, role_auth_middleware_1.roleAuth)(["ADMIN"]), paymentController.getPaymentsByApplication);
// Get payment details (requires authentication)
router.get("/:id", (0, role_auth_middleware_1.roleAuth)(["USER", "ADMIN"]), paymentController.getPaymentDetails);
