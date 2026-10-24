"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryValidation = void 0;
const express_validator_1 = require("express-validator");
exports.deliveryValidation = [
    (0, express_validator_1.body)("orderId").isString().notEmpty().withMessage("Order ID is required"),
    (0, express_validator_1.body)("deliveryAddress").isObject().notEmpty().withMessage("Delivery address is required"),
    // Tracking number is assigned later by the delivery agent, so it is not
    // required when the customer first saves their address.
    (0, express_validator_1.body)("trackingNumber").optional({ nullable: true }).isString().withMessage("Tracking number must be a string"),
];
