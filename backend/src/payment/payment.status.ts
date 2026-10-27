import Payment from "./payment.schema";
import userSchema from "../user/user.schema";
import { Application } from "../application/application.schema";
import { emitTransactionEvent } from "../common/services/socket.services";

/**
 * Single source of truth for changing a payment's status.
 *
 * Used by both the Razorpay webhook and the on-demand Razorpay sync, so the two
 * paths can never diverge. Guarantees:
 *  - A record is only matched by identifiers that are actually present. An
 *    empty/undefined identifier never reaches the query (Mongoose casts
 *    `{ orderId: undefined }` to `{}`, which would match an arbitrary payment).
 *  - A PAID payment is never downgraded by a late/out-of-order event.
 *  - Side effects (application advance, socket event) run only on a real change.
 */

export type PaymentStatus = "CREATED" | "ATTEMPTED" | "PAID" | "FAILED" | "CANCELLED";

export interface PaymentIdentifiers {
  /** Razorpay payment link id (plink_...), stored as Payment.orderId. */
  paymentLinkId?: string;
  /** Razorpay payment id (pay_...). */
  paymentId?: string;
  /** Razorpay order id (order_...) backing the payment link. */
  razorpayOrderId?: string;
  /** Our own reference, sent in link notes and stored as paymentSessionId. */
  paymentRef?: string;
}

export interface ApplyStatusInput {
  identifiers: PaymentIdentifiers;
  status: PaymentStatus;
  paidAt?: Date;
  /** Raw event/snapshot kept for auditing. */
  raw?: unknown;
  source: "webhook" | "sync";
}

export type ApplyStatusOutcome = "updated" | "unchanged" | "not_found";

export interface ApplyStatusResult {
  outcome: ApplyStatusOutcome;
  paymentId?: string;
  status?: string;
}

const nonEmpty = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

const buildMatch = (ids: PaymentIdentifiers): Record<string, string>[] => {
  const or: Record<string, string>[] = [];
  if (nonEmpty(ids.paymentLinkId)) or.push({ orderId: ids.paymentLinkId });
  if (nonEmpty(ids.paymentId)) or.push({ paymentId: ids.paymentId });
  if (nonEmpty(ids.razorpayOrderId)) or.push({ razorpayOrderId: ids.razorpayOrderId });
  if (nonEmpty(ids.paymentRef)) or.push({ paymentSessionId: ids.paymentRef });
  return or;
};

export const applyPaymentStatus = async (input: ApplyStatusInput): Promise<ApplyStatusResult> => {
  const { identifiers, status, paidAt, raw, source } = input;

  const or = buildMatch(identifiers);
  if (or.length === 0) return { outcome: "not_found" };

  const existing = await Payment.findOne({ $or: or });
  if (!existing) return { outcome: "not_found" };

  // Never downgrade a completed payment (e.g. a late payment.failed for an
  // earlier attempt arriving after payment_link.paid).
  if (existing.paymentStatus === "PAID" && status !== "PAID") {
    return { outcome: "unchanged", paymentId: String(existing._id), status: existing.paymentStatus };
  }

  const set: Record<string, unknown> = { paymentStatus: status, lastEvent: { source, at: new Date(), raw } };
  if (nonEmpty(identifiers.paymentId)) set.paymentId = identifiers.paymentId;
  if (nonEmpty(identifiers.razorpayOrderId)) set.razorpayOrderId = identifiers.razorpayOrderId;
  if (status === "PAID") set.paymentDate = paidAt ?? existing.paymentDate ?? new Date();

  // Re-assert the no-downgrade rule atomically to close the race with a
  // concurrent PAID update.
  const guard = status === "PAID" ? {} : { paymentStatus: { $ne: "PAID" } };
  const updated = await Payment.findOneAndUpdate({ _id: existing._id, ...guard }, { $set: set }, { new: true });
  if (!updated) {
    return { outcome: "unchanged", paymentId: String(existing._id), status: "PAID" };
  }

  const changed = existing.paymentStatus !== updated.paymentStatus;

  if (updated.user) {
    await userSchema.findByIdAndUpdate(updated.user, { $addToSet: { payment: updated._id } });
  }

  // Advance the linked application on success. Only from an early state so an
  // admin-set status (AGENT ASSIGNED / DONE / REJECTED) is never overwritten.
  // FAILED / CANCELLED leave the application as-is so the user can retry.
  if (status === "PAID" && updated.applicationId) {
    const app = await Application.findOneAndUpdate(
      { _id: updated.applicationId, status: { $in: ["PENDING", "NOT SUBMITTED"] } },
      { status: "AGENT ASSIGNED" },
      { new: true }
    );
    if (app) {
      console.log("Application advanced to AGENT ASSIGNED after payment", {
        applicationId: String(updated.applicationId),
        paymentId: String(updated._id),
        source,
      });
    }
  }

  if (changed) {
    console.log("Payment status changed", {
      paymentId: String(updated._id),
      from: existing.paymentStatus,
      to: updated.paymentStatus,
      source,
    });
    emitTransactionEvent(updated.user ? updated.user.toString() : null, "transaction:update", {
      paymentId: updated._id.toString(),
      orderId: updated.orderId,
      paymentStatus: updated.paymentStatus,
      amount: updated.amount,
      currency: updated.currency,
      paymentMethod: updated.paymentMethod,
      applicationId: updated.applicationId?.toString(),
      bankName: updated.bankName ?? undefined,
      paymentDate: updated.paymentDate ?? null,
      updatedAt: (updated as unknown as { updatedAt?: Date }).updatedAt,
    });
  }

  return { outcome: changed ? "updated" : "unchanged", paymentId: String(updated._id), status: updated.paymentStatus };
};
