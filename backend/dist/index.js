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
// Add debugging for Vercel environment
if (process.env.VERCEL) {
    console.log("Running in Vercel environment");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Available environment variables:", Object.keys(process.env).filter(key => key.includes('MONGODB') || key.includes('EMAIL') || key.includes('CLOUDINARY') || key.includes('JWT')));
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
    try {
        console.log("Starting app initialization...");
        yield (0, database_services_1.initDB)();
        console.log("Database initialized");
        (0, passport_jwt_services_1.initPassport)();
        console.log("Passport initialized");
        app.use("/api", routes_1.default);
        console.log("Routes configured");
        app.get("/", (_, res) => {
            res.send({ status: "ok" });
        });
        app.use(error_handler_1.default);
        console.log("Error handler configured");
        // Only start server if not in Vercel environment
        if (!process.env.VERCEL) {
            http_1.default.createServer(app).listen(port, () => {
                console.log("Server running on port", port);
            });
        }
        else {
            console.log("App ready for Vercel deployment");
        }
    }
    catch (error) {
        console.error("Failed to initialize app:", error);
        console.error("Error details:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : 'Unknown'
        });
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
});
// Export the app for Vercel
exports.default = app;
// Only run initApp if not in Vercel environment
if (!process.env.VERCEL) {
    void initApp();
}
else {
    // Initialize for Vercel
    void initApp();
}
