import { Router } from "express";
import * as paymentController from "./payment.controller";
import { roleAuth } from "../common/middleware/role-auth.middleware";

const router = Router();

// Create a new payment order
router.post(
  "/create",
  roleAuth(["USER", "ADMIN"]),
  paymentController.createPayment
);

// Verify payment after successful transaction
router.post(
  "/verify",
  roleAuth(["USER", "ADMIN"]),
  paymentController.verifyPayment
);

// List all payments for the authenticated user
router.get(
  "/list",
  roleAuth(["USER", "ADMIN"]),
  paymentController.listPayments
);

// Get payment details by ID
router.get(
  "/:id",
  roleAuth(["USER", "ADMIN"]),
  paymentController.getPaymentDetails
);

export default router;