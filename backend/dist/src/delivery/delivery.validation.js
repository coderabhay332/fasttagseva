"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryValidation = void 0;
const express_validator_1 = require("express-validator");
exports.deliveryValidation = [
    (0, express_validator_1.body)("orderId").isString().notEmpty().withMessage("Order ID is required"),
    (0, express_validator_1.body)("deliveryAddress").isObject().notEmpty().withMessage("Delivery address is required"),
    (0, express_validator_1.body)("trackingNumber").isString().notEmpty().withMessage("Tracking number is required"),
];
