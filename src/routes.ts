import express from "express"
import userRoutes from "./user/user.route";
import paymentRoutes from "./payment/payment.routes";   
const router = express.Router();

router.use("/users", userRoutes);
router.use("/payments", paymentRoutes);

export default router;
