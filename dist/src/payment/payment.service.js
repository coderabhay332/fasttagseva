"use strict";
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
exports.verifyPayment = exports.createPaymentService = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const payment_schema_1 = __importDefault(require("./payment.schema"));
const user_schema_1 = __importDefault(require("../user/user.schema"));
// Initialize Razorpay instance
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});
const createPaymentService = (amount, customerName, customerEmail, customerPhone, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Convert amount to paise (Razorpay uses smallest currency unit)
        const amountInPaise = Math.round(amount * 100);
        const receiptId = `order_${Date.now()}`;
        // Create Razorpay order
        const orderResponse = yield razorpay.orders.create({
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
        const order = orderResponse;
        // Generate payment URL
        const paymentLink = `https://checkout.razorpay.com/v1/checkout.html?payment_id=${order.id}`;
        // Save payment to DB
        const paymentDoc = yield payment_schema_1.default.create({
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
        yield user_schema_1.default.findByIdAndUpdate(userId, { $push: { payments: paymentDoc._id } }, { new: true });
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
    }
    catch (error) {
        console.error("Razorpay payment error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const errorDescription = error && typeof error === 'object' && 'error' in error
            ? (_a = error.error) === null || _a === void 0 ? void 0 : _a.description
            : undefined;
        return {
            success: false,
            message: "Failed to create payment order",
            error: errorDescription || errorMessage,
        };
    }
});
exports.createPaymentService = createPaymentService;
// Add this function to verify payment signature and update payment status
const verifyPayment = (orderId, paymentId, signature) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verify the payment signature
        const text = orderId + "|" + paymentId;
        const generatedSignature = crypto_1.default
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
        const payment = yield razorpay.payments.fetch(paymentId);
        // Update payment status in database
        const updateData = {
            paymentStatus: payment.status === 'captured' ? 'PAID' : 'FAILED',
            paymentId: payment.id,
            paymentDate: new Date(payment.created_at * 1000), // Convert from seconds to milliseconds
            'response.payment': payment
        };
        if (payment.status === 'captured') {
            updateData.paymentStatus = 'PAID';
        }
        else if (payment.status === 'failed') {
            updateData.paymentStatus = 'FAILED';
        }
        const updatedPayment = yield payment_schema_1.default.findOneAndUpdate({ orderId }, updateData, { new: true });
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
    }
    catch (error) {
        console.error('Error verifying payment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            success: false,
            message: 'Error verifying payment',
            error: errorMessage
        };
    }
});
exports.verifyPayment = verifyPayment;
