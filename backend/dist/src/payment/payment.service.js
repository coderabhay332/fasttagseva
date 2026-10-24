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
exports.getPaymentsByApplication = exports.listPayments = exports.checkOrderStatus = exports.createPaymentService = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const payment_schema_1 = __importDefault(require("./payment.schema"));
const user_schema_1 = __importDefault(require("../user/user.schema"));
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});
const createPaymentService = (amount_1, customerName_1, customerEmail_1, customerPhone_1, userId_1, applicationId_1, bankName_1, ...args_1) => __awaiter(void 0, [amount_1, customerName_1, customerEmail_1, customerPhone_1, userId_1, applicationId_1, bankName_1, ...args_1], void 0, function* (amount, customerName, customerEmail, customerPhone, userId, applicationId, bankName, paymentMethod = "CARD") {
    // Validate environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error("Missing Razorpay environment variables:", {
            hasKeyId: !!process.env.RAZORPAY_KEY_ID,
            hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET
        });
        return {
            success: false,
            message: "Razorpay configuration is missing",
            error: "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not found"
        };
    }
    if (!amount || amount <= 0) {
        return {
            success: false,
            message: "Invalid amount",
            error: "Amount must be greater than 0"
        };
    }
    if (!customerName || !customerEmail || !customerPhone) {
        return {
            success: false,
            message: "Missing customer information",
            error: "Customer name, email, and phone are required"
        };
    }
    try {
        const amountInPaise = Math.round(amount * 100);
        const receiptId = `pl_${Date.now()}`;
        // Create Razorpay Payment Link
        // Configure payment methods based on the selected method
        const paymentLinkOptions = {
            amount: amountInPaise,
            currency: "INR",
            accept_partial: false,
            description: `Payment for ${customerName}`,
            customer: {
                name: customerName,
                email: customerEmail,
                contact: customerPhone,
            },
            notify: {
                sms: true,
                email: true,
            },
            reminder_enable: true,
            notes: {
                userId: userId.toString(),
                customerName,
                customerEmail,
                customerPhone,
                paymentMethod
            },
            callback_url: `${process.env.FRONTEND_BASE_URL || process.env.BASE_URL}/onboarding/${applicationId}`,
            callback_method: 'get'
        };
        // Add UPI configuration to make it prominent
        if (paymentMethod === "UPI") {
            paymentLinkOptions.options = {
                checkout: {
                    method: {
                        upi: {
                            flow: "intent" // This makes UPI the primary payment method
                        }
                    }
                }
            };
        }
        const paymentLink = yield razorpay.paymentLink.create(paymentLinkOptions);
        // Save in DB
        const paymentDoc = yield payment_schema_1.default.create({
            orderId: paymentLink.id,
            amount,
            currency: "INR",
            customerName,
            customerEmail,
            customerPhone,
            paymentStatus: paymentLink.status.toUpperCase(), // Convert to uppercase to match schema enum
            paymentLink: paymentLink.short_url,
            response: paymentLink,
            user: userId,
            applicationId: applicationId,
            bankName: bankName,
            paymentMethod: paymentMethod.toUpperCase()
        });
        yield user_schema_1.default.findByIdAndUpdate(userId, { $addToSet: { payment: paymentDoc._id } }, { new: true });
        return {
            success: true,
            payment: {
                paymentId: paymentDoc._id,
                orderId: paymentLink.id,
                amount,
                currency: "INR",
                paymentStatus: paymentLink.status,
                paymentUrl: paymentLink.short_url,
                paymentMethod: paymentMethod.toUpperCase(),
                receipt: receiptId,
                createdAt: new Date()
            },
            razorpayPaymentLink: paymentLink,
            message: "Payment link created successfully"
        };
    }
    catch (error) {
        console.error("Razorpay payment link error:", error);
        // Better error handling for different error types
        let errorMessage = "Unknown error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        else if (typeof error === 'object' && error !== null) {
            // Handle Razorpay API errors
            const razorpayError = error;
            if (razorpayError.error) {
                errorMessage = razorpayError.error.description || razorpayError.error.reason || JSON.stringify(razorpayError.error);
            }
            else if (razorpayError.message) {
                errorMessage = razorpayError.message;
            }
            else {
                errorMessage = JSON.stringify(error);
            }
        }
        return {
            success: false,
            message: "Failed to create payment link",
            error: errorMessage
        };
    }
});
exports.createPaymentService = createPaymentService;
const checkOrderStatus = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield razorpay.orders.fetch(orderId);
        return {
            success: true,
            order: order,
            message: "Order details fetched successfully"
        };
    }
    catch (error) {
        console.error("Error fetching order:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            success: false,
            message: "Failed to fetch order details",
            error: errorMessage
        };
    }
});
exports.checkOrderStatus = checkOrderStatus;
const listPayments = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit)); // Max 100 items per page
    const skip = (validPage - 1) * validLimit;
    // Get total count for pagination info
    const totalCount = yield payment_schema_1.default.countDocuments({ user: userId });
    // Get paginated payments with only specific fields
    const payments = yield payment_schema_1.default.find({ user: userId })
        .select('amount customerName customerEmail customerPhone paymentStatus paymentMethod createdAt applicationId orderId paymentId bankName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validLimit);
    const totalPages = Math.ceil(totalCount / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;
    return {
        success: true,
        payments: payments,
        pagination: {
            currentPage: validPage,
            totalPages,
            totalCount,
            limit: validLimit,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? validPage + 1 : null,
            prevPage: hasPrevPage ? validPage - 1 : null
        },
        message: "Payments fetched successfully"
    };
});
exports.listPayments = listPayments;
// Get payments by application ID (for admin panel)
const getPaymentsByApplication = (applicationId_1, ...args_1) => __awaiter(void 0, [applicationId_1, ...args_1], void 0, function* (applicationId, page = 1, limit = 10) {
    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;
    // Get total count for pagination info
    const totalCount = yield payment_schema_1.default.countDocuments({ applicationId });
    // Get paginated payments with application details
    const payments = yield payment_schema_1.default.find({ applicationId })
        .select('amount customerName customerEmail customerPhone paymentStatus paymentMethod paymentDate createdAt orderId paymentId bankName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validLimit);
    const totalPages = Math.ceil(totalCount / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;
    return {
        success: true,
        payments: payments,
        pagination: {
            currentPage: validPage,
            totalPages,
            totalCount,
            limit: validLimit,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? validPage + 1 : null,
            prevPage: hasPrevPage ? validPage - 1 : null
        },
        message: "Application payments fetched successfully"
    };
});
exports.getPaymentsByApplication = getPaymentsByApplication;
