import { check, body } from "express-validator";

export const deliveryValidation = [
    body("orderId").isString().notEmpty().withMessage("Order ID is required"),
    body("deliveryAddress").isObject().notEmpty().withMessage("Delivery address is required"),
    // Tracking number is assigned later by the delivery agent, so it is not
    // required when the customer first saves their address.
    body("trackingNumber").optional({ nullable: true }).isString().withMessage("Tracking number must be a string"),
];