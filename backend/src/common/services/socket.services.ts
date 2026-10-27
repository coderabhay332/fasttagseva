import type { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * Real-time transaction notifications via Socket.IO.
 *
 * Clients open a socket, authenticate with their JWT access token (the same
 * token used by the REST routes), and are placed into a private room keyed by
 * their user id. The payment service and the Razorpay webhook emit
 * `transaction:update` events into that room so each user only ever receives
 * events for their own transactions.
 *
 * The server is optional at runtime: on platforms where no http.Server is
 * created (e.g. Vercel serverless), `initSocket` is never called and
 * `emitTransactionEvent` becomes a safe no-op, so the payment flow is never
 * blocked by the absence of a socket server.
 */

export type TransactionEventType =
  | "transaction:created"
  | "transaction:update";

export interface TransactionEventPayload {
  paymentId: string;
  orderId: string;
  paymentStatus: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  applicationId?: string;
  bankName?: string;
  paymentDate?: Date | null;
  updatedAt?: Date;
}

// Allowed origins mirror the Express CORS allowlist in index.ts.
const ALLOWED_ORIGINS = [
  "https://tagseva.com",
  "https://www.tagseva.com",
  "https://tagseva.vercel.app",
  "https://fastagseva-frontend.vercel.app",
  "https://fasttagseva-c8zo.vercel.app",
  "https://fasttagseva.onrender.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
];

let io: SocketIOServer | null = null;

/** Room name for a given user. Scopes events to a single user. */
const userRoom = (userId: string): string => `user:${userId}`;

/**
 * Extract and verify the JWT from the handshake. Mirrors the verification used
 * by the roleAuth middleware (JWT_ACCESS_SECRET, falling back to JWT_SECRET).
 */
const authenticateSocket = (socket: Socket): string | null => {
  const accessSecret = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET;
  if (!accessSecret) {
    console.error("Socket auth failed: JWT access secret is not set");
    return null;
  }

  // Token can arrive via `auth.token` (recommended) or an Authorization header.
  const authToken = (socket.handshake.auth as { token?: string } | undefined)?.token;
  const headerToken = socket.handshake.headers.authorization?.replace("Bearer ", "");
  const token = authToken ?? headerToken;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, accessSecret) as JwtPayload;
    // Tokens carry the user id under `_id` (see createUserTokens), fall back to `id`.
    const userId = (decoded?._id ?? (decoded as { id?: string })?.id) as string | undefined;
    return userId ?? null;
  } catch {
    return null;
  }
};

/** Attach Socket.IO to the given HTTP server. Call once during startup. */
export const initSocket = (server: HttpServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow non-browser clients (no origin) and allow-listed origins.
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  // Reject unauthenticated connections at the handshake.
  io.use((socket, next) => {
    const userId = authenticateSocket(socket);
    if (!userId) {
      next(new Error("Unauthorized"));
      return;
    }
    // Stash the verified user id on the socket for use after connection.
    (socket.data as { userId?: string }).userId = userId;
    next();
  });

  io.on("connection", (socket) => {
    const userId = (socket.data as { userId?: string }).userId;
    if (userId) {
      void socket.join(userRoom(userId));
      console.log("Socket connected", { socketId: socket.id, userId });
    }

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected", { socketId: socket.id, userId, reason });
    });
  });

  console.log("Socket.IO initialized");
  return io;
};

/**
 * Emit a transaction event to a single user's room. Safe no-op if the socket
 * server was never initialized. Never throws, so callers in the payment flow
 * are never broken by socket errors.
 */
export const emitTransactionEvent = (
  userId: string | null | undefined,
  event: TransactionEventType,
  payload: TransactionEventPayload
): void => {
  try {
    if (!io) {
      // Socket server not running (e.g. serverless). Skip silently.
      return;
    }
    if (!userId) {
      console.warn("emitTransactionEvent called without a userId; skipping", { event });
      return;
    }
    io.to(userRoom(userId)).emit(event, payload);
  } catch (err) {
    // Never let a notification failure interfere with the payment flow.
    console.error("Failed to emit transaction event:", err);
  }
};

export const getIO = (): SocketIOServer | null => io;
