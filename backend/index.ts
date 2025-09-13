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

// Only load dotenv in non-Vercel environments
if (!process.env.VERCEL) {
  dotenv.config();
}

declare global {
  namespace Express {
    interface User extends Omit<IUser, "password"> {}
    interface Request {
      user?: User;
    }
  }
}

const port = Number(process.env.PORT) ?? 5000;
const app = express();

// 👇 Register webhook route with RAW body parser FIRST
app.post(
  "/api/payments/webhook",
  bodyParser.raw({ type: "application/json" }), // keep raw body for signature verification
  paymentsWebhookHandler
);

// 👇 Other middlewares
app.use(cors({
  origin: [
   "https://fastagseva-frontend.vercel.app/"
  ],
  credentials: true,
}));
app.use(helmet());
app.use(express.json()); // safe AFTER webhook
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

const initApp = async (): Promise<void> => {
  await initDB();
  initPassport();

  app.use("/api", routes);

  app.get("/", (_, res) => {
    res.send({ status: "ok" });
  });

  app.use(errorHandler);

  http.createServer(app).listen(port, () => {
    console.log("Server running on port", port);
  });
};

void initApp();
