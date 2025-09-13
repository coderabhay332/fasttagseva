"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const error_handler_1 = __importDefault(require("./src/common/middleware/error.handler"));
const database_services_1 = require("./src/common/services/database.services");
const passport_jwt_services_1 = require("./src/common/services/passport-jwt.services");
const routes_1 = __importDefault(require("./src/routes"));
const payment_webhook_1 = require("./src/payment/payment.webhook");
// Only load dotenv in non-Vercel environments
if (!process.env.VERCEL) {
    dotenv_1.default.config();
}
const port = (_a = Number(process.env.PORT)) !== null && _a !== void 0 ? _a : 5000;
const app = (0, express_1.default)();
// 👇 Register webhook route with RAW body parser FIRST
app.post("/api/payments/webhook", body_parser_1.default.raw({ type: "application/json" }), // keep raw body for signature verification
payment_webhook_1.verifyWebhook);
// 👇 Other middlewares
app.use((0, cors_1.default)({
    origin: [
        "https://fastagseva-frontend.vercel.app/"
    ],
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json()); // safe AFTER webhook
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, morgan_1.default)("dev"));
const initApp = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_services_1.initDB)();
    (0, passport_jwt_services_1.initPassport)();
    app.use("/api", routes_1.default);
    app.get("/", (_, res) => {
        res.send({ status: "ok" });
    });
    app.use(error_handler_1.default);
    http_1.default.createServer(app).listen(port, () => {
        console.log("Server running on port", port);
    });
});
void initApp();
