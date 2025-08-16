"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("./user/user.route"));
const payment_routes_1 = __importDefault(require("./payment/payment.routes"));
const profile_routes_1 = __importDefault(require("./profile/profile.routes"));
const application_routes_1 = __importDefault(require("./application/application.routes"));
const router = express_1.default.Router();
router.use("/users", user_route_1.default);
router.use("/payments", payment_routes_1.default);
router.use("/profiles", profile_routes_1.default);
router.use("/applications", application_routes_1.default);
exports.default = router;
