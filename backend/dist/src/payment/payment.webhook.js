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
exports.verifyWebhook = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const crypto_1 = __importDefault(require("crypto"));
const payment_schema_1 = __importDefault(require("./payment.schema"));
const user_schema_1 = __importDefault(require("../user/user.schema"));
const response_helper_1 = require("../common/helper/response.helper");
exports.verifyWebhook = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(req.body || '');
    console.log(webhookSecret, signature, rawBody);
    if (!signature || !webhookSecret) {
        res.status(400).json((0, response_helper_1.createResponse)(null, "Missing webhook signature or secret"));
        return;
    }
    const expected = crypto_1.default
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');
    if (expected !== signature) {
        res.status(400).json((0, response_helper_1.createResponse)(null, "Invalid webhook signature"));
        return;
    }
    try {
        const event = JSON.parse(rawBody.toString());
        const eventType = event.event;
        console.log("Webhook verified:", { event: eventType });
        const updatePaymentFromWebhook = (eventType, plEntity, payEntity, rawEvent) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                console.log('updatePaymentFromWebhook called with:', { eventType, plEntity, payEntity }); // <-- Add this
                const paymentLinkId = (plEntity === null || plEntity === void 0 ? void 0 : plEntity.id) || (payEntity === null || payEntity === void 0 ? void 0 : payEntity.link_id);
                const paymentId = payEntity === null || payEntity === void 0 ? void 0 : payEntity.id;
                if (!paymentLinkId && !paymentId) {
                    console.error('Missing identifiers from webhook', { plEntity, payEntity });
                    return { success: false, message: 'Missing identifiers from webhook' };
                }
                // Determine status
                let sourceStatus = ((plEntity === null || plEntity === void 0 ? void 0 : plEntity.status) || (payEntity === null || payEntity === void 0 ? void 0 : payEntity.status) || ((_c = (_b = (_a = rawEvent === null || rawEvent === void 0 ? void 0 : rawEvent.payload) === null || _a === void 0 ? void 0 : _a.payment_link) === null || _b === void 0 ? void 0 : _b.entity) === null || _c === void 0 ? void 0 : _c.status) || '').toLowerCase();
                // Map 'created' to 'PAID' only for successful payment events
                if (sourceStatus === 'created' &&
                    (eventType === 'payment.link.paid' || eventType === 'payment.captured')) {
                    sourceStatus = 'paid';
                }
                console.log("sourceStatus", sourceStatus);
                let mappedStatus = 'ATTEMPTED';
                if (sourceStatus === 'paid' || sourceStatus === 'captured')
                    mappedStatus = 'PAID';
                else if (sourceStatus === 'failed')
                    mappedStatus = 'FAILED';
                else if (sourceStatus === 'cancelled' || sourceStatus === 'expired')
                    mappedStatus = 'CANCELLED';
                else if (sourceStatus === 'partially_paid')
                    mappedStatus = 'ATTEMPTED';
                const filter = { orderId: paymentLinkId };
                const updateData = {
                    paymentStatus: mappedStatus,
                    'response.webhook': rawEvent || null
                };
                if (paymentId)
                    updateData.paymentId = paymentId;
                const ts = (payEntity === null || payEntity === void 0 ? void 0 : payEntity.created_at) || (plEntity === null || plEntity === void 0 ? void 0 : plEntity.updated_at) || (plEntity === null || plEntity === void 0 ? void 0 : plEntity.created_at);
                if (ts)
                    updateData.paymentDate = new Date(Number(ts) * 1000);
                const updatedPayment = yield payment_schema_1.default.findOneAndUpdate(filter, updateData, { new: true });
                if (!updatedPayment) {
                    console.error('Payment record not found for webhook identifiers', { filter, updateData });
                    return { success: false, message: 'Payment record not found for webhook identifiers' };
                }
                // Ensure user has reference to this payment
                if (updatedPayment.user) {
                    yield user_schema_1.default.findByIdAndUpdate(updatedPayment.user, { $addToSet: { payment: updatedPayment._id } }, { new: true });
                }
                return { success: true, payment: updatedPayment };
            }
            catch (err) {
                console.error('Error in updatePaymentFromWebhook:', err);
                return { success: false, message: 'Internal error in payment update', error: err };
            }
        });
        if (eventType === 'payment_link.paid' || eventType === 'payment_link.cancelled' || eventType === 'payment_link.partially_paid' || eventType === 'payment_link.expired') {
            const pl = (_b = (_a = event.payload) === null || _a === void 0 ? void 0 : _a.payment_link) === null || _b === void 0 ? void 0 : _b.entity;
            const pay = (_d = (_c = event.payload) === null || _c === void 0 ? void 0 : _c.payment) === null || _d === void 0 ? void 0 : _d.entity; // might be undefined for link events
            console.log('Webhook payload:', { pl, pay, eventType }); // <-- Add this
            const result = yield updatePaymentFromWebhook(eventType, pl, pay, event);
            if (!result.success) {
                res.status(400).json({ success: false, message: result.message, error: result.error });
                return;
            }
            res.json((0, response_helper_1.createResponse)(result.payment, "Webhook processed"));
            return;
        }
        if (eventType === 'payment.captured' || eventType === 'payment.failed') {
            const pay = (_f = (_e = event.payload) === null || _e === void 0 ? void 0 : _e.payment) === null || _f === void 0 ? void 0 : _f.entity;
            const pl = undefined;
            console.log('Webhook payload:', { pl, pay, eventType }); // <-- Add this
            const result = yield updatePaymentFromWebhook(eventType, pl, pay, event);
            if (!result.success) {
                res.status(400).json({ success: false, message: result.message, error: result.error });
                return;
            }
            res.json((0, response_helper_1.createResponse)(result.payment, "Webhook processed"));
            return;
        }
        res.status(400).json((0, response_helper_1.createResponse)(null, "Unhandled event type"));
    }
    catch (err) {
        console.error('Webhook processing error:', err);
        res.status(500).json((0, response_helper_1.createResponse)("Webhook processing error", String(err)));
    }
}));
