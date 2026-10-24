"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliverySchema = void 0;
const mongoose_1 = require("mongoose");
const deliverySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderId: {
        type: String,
        required: true,
    },
    deliveryStatus: {
        type: String,
        required: false,
        default: "pending",
    },
    deliveryAddress: {
        type: Object,
        required: true,
    },
    trackingNumber: {
        type: String,
        required: false,
    },
});
exports.DeliverySchema = (0, mongoose_1.model)("Delivery", deliverySchema);
