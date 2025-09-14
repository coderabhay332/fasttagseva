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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentsByApplication = exports.getPaymentDetails = exports.listPayments = exports.checkOrderStatus = exports.createPayment = exports.testRazorpayConfig = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_async_handler_2 = __importDefault(require("express-async-handler"));
const paymentService = __importStar(require("./payment.service"));
const payment_schema_1 = __importDefault(require("./payment.schema"));
const response_helper_1 = require("../common/helper/response.helper");
exports.testRazorpayConfig = (0, express_async_handler_2.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
exports.createPayment = (0, express_async_handler_2.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, customerName, customerEmail, customerPhone, applicationId, bankName } = req.body;
    if (!amount || !customerName || !customerEmail || !customerPhone || !applicationId || !bankName) {
        res.status(400).json((0, response_helper_1.createResponse)(null, "Missing required fields"));
        return;
    }
    if (!req.user || !req.user._id) {
        res.status(401).json((0, response_helper_1.createResponse)(null, "Unauthorized"));
        return;
    }
    const result = yield paymentService.createPaymentService(amount, customerName, customerEmail, customerPhone, req.user._id, applicationId, bankName);
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
            paymentUrl: result.payment.paymentUrl, // ✅ Direct link for frontend
            receipt: result.payment.receipt,
            createdAt: result.payment.createdAt
        },
        message: result.message
    });
}));
exports.checkOrderStatus = (0, express_async_handler_2.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    if (!orderId) {
        res.status(400).json((0, response_helper_1.createResponse)(null, "Order ID is required"));
        return;
    }
    const result = yield paymentService.checkOrderStatus(orderId);
    if (!result.success) {
        res.status(400).json({
            success: false,
            message: result.message,
            error: result.error || 'Unknown error occurred'
        });
        return;
    }
    res.json((0, response_helper_1.createResponse)(result.order, "Order status fetched successfully"));
}));
/**
 * List all payments for the authenticated user
 */
exports.listPayments = (0, express_async_handler_2.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user._id) {
        res.status(401).json((0, response_helper_1.createResponse)(null, "Unauthorized"));
        return;
    }
    // Extract pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = yield paymentService.listPayments(req.user._id, page, limit);
    res.json((0, response_helper_1.createResponse)(result, "Payments fetched successfully"));
}));
/**
 * Get payment details by ID
 */
exports.getPaymentDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!req.user || !req.user._id) {
        res.status(401).json((0, response_helper_1.createResponse)(null, "Unauthorized"));
        return;
    }
    try {
        const payment = yield payment_schema_1.default.findOne({ _id: id, user: req.user._id });
        if (!payment) {
            res.status(404).json((0, response_helper_1.createResponse)(null, "Payment not found"));
            return;
        }
        res.json((0, response_helper_1.createResponse)(payment, "Payment details fetched successfully"));
    }
    catch (error) {
        console.error("Error fetching payment details:", error);
        res.status(500).json((0, response_helper_1.createResponse)(null, "Error fetching payment details"));
    }
}));
/**
 * Get payments by application ID (for admin panel)
 */
exports.getPaymentsByApplication = (0, express_async_handler_2.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { applicationId } = req.params;
    if (!applicationId) {
        res.status(400).json((0, response_helper_1.createResponse)(null, "Application ID is required"));
        return;
    }
    // Extract pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = yield paymentService.getPaymentsByApplication(applicationId, page, limit);
    res.json((0, response_helper_1.createResponse)(result, "Application payments fetched successfully"));
}));
/**
 * Razorpay Webhook handler (uses raw body to compute signature)
 * Header: x-razorpay-signature, Secret: process.env.RAZORPAY_WEBHOOK_SECRET (recommended)
 */
