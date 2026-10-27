import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import crypto from "crypto";
import { applyPaymentStatus, PaymentIdentifiers, PaymentStatus } from "./payment.status";

/**
 * Razorpay webhook: POST /api/payments/webhook
 *
 * Registered in index.ts with bodyParser.raw BEFORE express.json so the exact
 * bytes Razorpay signed are available for HMAC verification.
 *
 * Response policy (Razorpay retries any non-2xx and eventually disables a
 * webhook that keeps failing):
 *  - 400 only for requests that are not genuine Razorpay calls (bad signature / body).
 *  - 200 for every verified event, including ones we ignore (unsubscribed
 *    event types, or payments that don't belong to this app).
 *  - 500 for unexpected processing errors (e.g. DB down) so Razorpay retries.
 */

// Status is derived from the event type, not from entity status strings, so
// the mapping is explicit and can't drift.
const EVENT_STATUS: Record<string, PaymentStatus> = {
  "payment_link.paid": "PAID",
  "payment.captured": "PAID",
  "payment_link.partially_paid": "ATTEMPTED",
  "payment_link.cancelled": "CANCELLED",
  "payment_link.expired": "CANCELLED",
  "payment.failed": "FAILED",
};

const verifySignature = (rawBody: Buffer, signature: string, secret: string): boolean => {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signature, "utf8");
  // Constant-time comparison to avoid signature timing attacks.
  return expectedBuf.length === signatureBuf.length && crypto.timingSafeEqual(expectedBuf, signatureBuf);
};

/**
 * Collect every identifier the event carries. Payment-only events
 * (payment.captured / payment.failed) have no payment_link entity, so they are
 * matched via the payment id, the backing order id, our own notes.paymentRef,
 * or the "#<suffix>" description Razorpay sets for payment-link payments.
 */
const extractIdentifiers = (pl: any, pay: any): PaymentIdentifiers => {
  let paymentLinkId: string | undefined = pl?.id || pay?.link_id || undefined;
  if (!paymentLinkId && typeof pay?.description === "string") {
    const m = /^#([A-Za-z0-9]{14})$/.exec(pay.description.trim());
    if (m) paymentLinkId = `plink_${m[1]}`;
  }
  return {
    paymentLinkId,
    paymentId: pay?.id || undefined,
    razorpayOrderId: pl?.order_id || pay?.order_id || undefined,
    paymentRef: pay?.notes?.paymentRef || pl?.notes?.paymentRef || undefined,
  };
};

export const verifyWebhook = asyncHandler(async (req: Request, res: Response) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set; rejecting webhook");
    res.status(500).json({ success: false, message: "Webhook secret not configured" });
    return;
  }

  const signature = req.headers["x-razorpay-signature"];
  const rawBody: Buffer | null = Buffer.isBuffer(req.body) ? req.body : null;
  if (typeof signature !== "string" || !signature || !rawBody) {
    res.status(400).json({ success: false, message: "Missing webhook signature or body" });
    return;
  }

  if (!verifySignature(rawBody, signature, webhookSecret)) {
    console.warn("Razorpay webhook rejected: invalid signature");
    res.status(400).json({ success: false, message: "Invalid webhook signature" });
    return;
  }

  let event: any;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    res.status(400).json({ success: false, message: "Invalid JSON body" });
    return;
  }

  const eventType: string = event?.event ?? "";
  const status = EVENT_STATUS[eventType];
  if (!status) {
    // Acknowledge so Razorpay doesn't retry or disable the webhook.
    console.log("Razorpay webhook ignored: unhandled event", { event: eventType });
    res.json({ success: true, message: `Ignored event ${eventType}` });
    return;
  }

  const pl = event.payload?.payment_link?.entity;
  const pay = event.payload?.payment?.entity;
  const identifiers = extractIdentifiers(pl, pay);
  const ts = pay?.created_at || pl?.updated_at;

  try {
    const result = await applyPaymentStatus({
      identifiers,
      status,
      paidAt: ts ? new Date(Number(ts) * 1000) : undefined,
      raw: { event: eventType, id: req.headers["x-razorpay-event-id"], payload: event.payload },
      source: "webhook",
    });

    console.log("Razorpay webhook processed", {
      event: eventType,
      outcome: result.outcome,
      paymentId: result.paymentId,
      status: result.status,
      identifiers,
    });

    res.json({ success: true, message: `Webhook ${result.outcome}`, data: result });
  } catch (err) {
    console.error("Razorpay webhook processing error:", err);
    res.status(500).json({ success: false, message: "Webhook processing error" });
  }
});
