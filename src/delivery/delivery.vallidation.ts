import { check, body } from "express-validator";

export const deliveryValidation = [
    body("orderId").isString().notEmpty().withMessage("Order ID is required"),
    body("deliveryAddress").isObject().notEmpty().withMessage("Delivery address is required"),
    body("trackingNumber").isString().notEmpty().withMessage("Tracking number is required"),
];