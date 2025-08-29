import express from "express"
import userRoutes from "./user/user.route";
import { router as paymentRoutes, paymentWebhookRouter } from "./payment/payment.routes";   
import profileRoutes from "./profile/profile.routes";
import applicationRoutes from "./application/application.routes";
const router = express.Router();

router.use("/users", userRoutes);
router.use("/payments", paymentRoutes);
router.use("/profiles", profileRoutes);
router.use("/applications", applicationRoutes);
router.use("/payments/webhook", paymentWebhookRouter);

export default router;
