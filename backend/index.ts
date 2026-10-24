import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import dotenv from "dotenv";
import errorHandler from "./src/common/middleware/error.handler";
import { initDB } from "./src/common/services/database.services";
import { initPassport } from "./src/common/services/passport-jwt.services";
import { IUser } from "./src/user/user.dto";
import routes from "./src/routes";
import { verifyWebhook as paymentsWebhookHandler } from "./src/payment/payment.webhook";

// Load a local .env only for local development. On managed platforms
// (Vercel, AWS Elastic Beanstalk, etc.) env vars are injected by the platform,
// and in production we never read a .env file from disk.
if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Add debugging for Vercel environment
if (process.env.VERCEL) {
  console.log("Running in Vercel environment");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("Available environment variables:", Object.keys(process.env).filter(key => 
    key.includes('MONGODB') || key.includes('EMAIL') || key.includes('CLOUDINARY') || key.includes('JWT')
  ));
}

declare global {
  namespace Express {
    interface User extends Omit<IUser, "password"> {}
    interface Request {
      user?: User;
    }
  }
}

// Use `||` not `??`: `Number(undefined)` is NaN, and `NaN ?? 5000` would keep
// NaN (nullish coalescing only catches null/undefined). `|| 5000` falls back
// correctly when PORT is unset or non-numeric. Elastic Beanstalk sets PORT.
const port = Number(process.env.PORT) || 5000;
const app = express();

// 👇 Register webhook route with RAW body parser FIRST
app.post(
  "/api/payments/webhook",
  bodyParser.raw({ type: "application/json" }), // keep raw body for signature verification
  paymentsWebhookHandler
);

// 👇 Other middlewares
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "https://tagseva.com",
      "https://www.tagseva.com",
      "https://tagseva.vercel.app",
      "https://fastagseva-frontend.vercel.app",
      "https://fasttagseva-c8zo.vercel.app",
      "https://fasttagseva.onrender.com",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173", // Vite dev server
      "http://localhost:5174"  // Vite fallback port
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));
app.use(helmet());
app.use(express.json()); // safe AFTER webhook
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Set up routes immediately for Vercel
app.use("/api", routes);
console.log("Routes configured");

app.get("/", (_, res) => {
  res.send({ status: "ok" });
});

app.use(errorHandler);
console.log("Error handler configured");

const initApp = async (): Promise<void> => {
  try {
    console.log("Starting app initialization...");
    
    await initDB();
    console.log("Database initialized");
    
    initPassport();
    console.log("Passport initialized");

    // Only start server if not in Vercel environment
    if (!process.env.VERCEL) {
      http.createServer(app).listen(port, () => {
        console.log("Server running on port", port);
      });
    } else {
      console.log("App ready for Vercel deployment");
    }
  } catch (error) {
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
};

// Export the app for Vercel
export default app;

// Only run initApp if not in Vercel environment
if (!process.env.VERCEL) {
  void initApp();
} else {
  // Initialize for Vercel
  void initApp();
}
