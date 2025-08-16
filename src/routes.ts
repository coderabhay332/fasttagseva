import express from "express"
import userRoutes from "./user/user.route";
import paymentRoutes from "./payment/payment.routes";   
import profileRoutes from "./profile/profile.routes";
import applicationRoutes from "./application/application.routes";
const router = express.Router();

router.use("/users", userRoutes);
router.use("/payments", paymentRoutes);
router.use("/profiles", profileRoutes);
router.use("/applications", applicationRoutes);

export default router;
