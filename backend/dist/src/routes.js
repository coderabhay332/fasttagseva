"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("./user/user.route"));
const payment_routes_1 = require("./payment/payment.routes");
const profile_routes_1 = __importDefault(require("./profile/profile.routes"));
const application_routes_1 = __importDefault(require("./application/application.routes"));
const delivery_routes_1 = __importDefault(require("./delivery/delivery.routes"));
const router = express_1.default.Router();
router.use("/users", user_route_1.default);
router.use("/payments", payment_routes_1.router);
router.use("/profiles", profile_routes_1.default);
router.use("/applications", application_routes_1.default);
router.use("/delivery", delivery_routes_1.default);
router.use("/payments/webhook", payment_routes_1.paymentWebhookRouter);
exports.default = router;
