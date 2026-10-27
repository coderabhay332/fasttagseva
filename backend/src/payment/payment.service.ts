import Razorpay from "razorpay";
import Payment from "./payment.schema";
import userSchema from "../user/user.schema";
import crypto from 'crypto';
import { emitTransactionEvent } from "../common/services/socket.services";
import { applyPaymentStatus, PaymentStatus } from "./payment.status";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

export const createPaymentService = async (
  amount: number,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  userId: string,
  applicationId: string,
  bankName: string,
  paymentMethod: string = "CARD"
) => {
  // Validate environment variables
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("Missing Razorpay environment variables:", {
      hasKeyId: !!process.env.RAZORPAY_KEY_ID,
      hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET
    });
    return {
      success: false,
      message: "Razorpay configuration is missing",
      error: "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not found"
    };
  }


  if (!amount || amount <= 0) {
    return {
      success: false,
      message: "Invalid amount",
      error: "Amount must be greater than 0"
    };
  }

  if (!customerName || !customerEmail || !customerPhone) {
    return {
      success: false,
      message: "Missing customer information",
      error: "Customer name, email, and phone are required"
    };
  }

  try {
    const amountInPaise = Math.round(amount * 100);
    // Our own unique reference for this payment. Sent in the link notes (which
    // Razorpay copies onto the resulting payment) so payment.* webhooks can be
    // matched back to this record even though they carry no payment link id.
    const receiptId = `ft_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    // Create Razorpay Payment Link
    // Configure payment methods based on the selected method
    const paymentLinkOptions: any = {
      amount: amountInPaise,
      currency: "INR",
      accept_partial: false,
      description: `Payment for ${customerName}`,
      customer: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      notify: {
        sms: true,
        email: true,
      },
      reminder_enable: true,
      notes: {
        userId: userId.toString(),
        customerName,
        customerEmail,
        customerPhone,
        paymentMethod,
        paymentRef: receiptId
      },
      callback_url: `${process.env.FRONTEND_BASE_URL || process.env.BASE_URL}/onboarding/${applicationId}`,
      callback_method: 'get'
    };

    // Add UPI configuration to make it prominent.
    // NOTE: For the Payment LINKS API, `options.checkout.method.<method>` must be
    // a flag ("1" to enable), NOT a nested object. The nested `{ flow: "intent" }`
    // form belongs to the Checkout/Orders API and makes the Payment Links API reject
    // the request with "faulty key: options.checkout.method.upi".
    if (paymentMethod === "UPI") {
      paymentLinkOptions.options = {
        checkout: {
          method: {
            upi: "1"
          }
        }
      };
    }

    const paymentLink = await razorpay.paymentLink.create(paymentLinkOptions);

    // Save in DB
    const paymentDoc = await Payment.create({
      orderId: paymentLink.id,
      amount,
      currency: "INR",
      customerName,
      customerEmail,
      customerPhone,
      paymentStatus: paymentLink.status.toUpperCase(), // Convert to uppercase to match schema enum
      paymentLink: paymentLink.short_url,
      paymentSessionId: receiptId,
      razorpayOrderId: (paymentLink as any).order_id || undefined,
      response: paymentLink,
      user: userId,
      applicationId: applicationId,
      bankName: bankName,
      paymentMethod: paymentMethod.toUpperCase()
    });

    await userSchema.findByIdAndUpdate(
      userId,
      { $addToSet: { payment: paymentDoc._id } },
      { new: true }
    );

    // Notify the owning user in real time that a new transaction was created.
    emitTransactionEvent(userId, "transaction:created", {
      paymentId: paymentDoc._id.toString(),
      orderId: paymentDoc.orderId,
      paymentStatus: paymentDoc.paymentStatus,
      amount: paymentDoc.amount,
      currency: paymentDoc.currency,
      paymentMethod: paymentDoc.paymentMethod,
      applicationId: paymentDoc.applicationId?.toString(),
      bankName: paymentDoc.bankName ?? undefined,
      paymentDate: paymentDoc.paymentDate ?? null,
      updatedAt: (paymentDoc as unknown as { updatedAt?: Date }).updatedAt,
    });

    return {
      success: true,
      payment: {
        paymentId: paymentDoc._id,
        orderId: paymentLink.id,
        amount,
        currency: "INR",
        paymentStatus: paymentLink.status,
        paymentUrl: paymentLink.short_url,
        paymentMethod: paymentMethod.toUpperCase(),
        receipt: receiptId,
        createdAt: new Date()
      },
      razorpayPaymentLink: paymentLink,
      message: "Payment link created successfully"
    };
  } catch (error: unknown) {
    console.error("Razorpay payment link error:", error);
    
    // Better error handling for different error types
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // Handle Razorpay API errors
      const razorpayError = error as any;
      if (razorpayError.error) {
        errorMessage = razorpayError.error.description || razorpayError.error.reason || JSON.stringify(razorpayError.error);
      } else if (razorpayError.message) {
        errorMessage = razorpayError.message;
      } else {
        errorMessage = JSON.stringify(error);
      }
    }
    
    return {
      success: false,
      message: "Failed to create payment link",
      error: errorMessage
    };
  }
};

export const checkOrderStatus = async (orderId: string) => {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return {
      success: true,
      order: order,
      message: "Order details fetched successfully"
    };
  } catch (error: unknown) {
    console.error("Error fetching order:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: "Failed to fetch order details",
      error: errorMessage
    };
  }
};

export const listPayments = async (userId: string, page: number = 1, limit: number = 10) => {
  // Validate pagination parameters
  const validPage = Math.max(1, page);
  const validLimit = Math.min(100, Math.max(1, limit)); // Max 100 items per page
  const skip = (validPage - 1) * validLimit;

  // Get total count for pagination info
  const totalCount = await Payment.countDocuments({ user: userId });
  
  // Get paginated payments with only specific fields
  const payments = await Payment.find({ user: userId })
    .select('amount customerName customerEmail customerPhone paymentStatus paymentMethod createdAt applicationId orderId paymentId bankName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(validLimit);

  const totalPages = Math.ceil(totalCount / validLimit);
  const hasNextPage = validPage < totalPages;
  const hasPrevPage = validPage > 1;

  return {
    success: true,
    payments: payments,
    pagination: {
      currentPage: validPage,
      totalPages,
      totalCount,
      limit: validLimit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? validPage + 1 : null,
      prevPage: hasPrevPage ? validPage - 1 : null
    },
    message: "Payments fetched successfully"
  };
};

// Get payments by application ID (for admin panel)
export const getPaymentsByApplication = async (applicationId: string, page: number = 1, limit: number = 10) => {
  // Validate pagination parameters
  const validPage = Math.max(1, page);
  const validLimit = Math.min(100, Math.max(1, limit));
  const skip = (validPage - 1) * validLimit;

  // Get total count for pagination info
  const totalCount = await Payment.countDocuments({ applicationId });
  
  // Get paginated payments with application details
  const payments = await Payment.find({ applicationId })
    .select('amount customerName customerEmail customerPhone paymentStatus paymentMethod paymentDate createdAt orderId paymentId bankName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(validLimit);

  const totalPages = Math.ceil(totalCount / validLimit);
  const hasNextPage = validPage < totalPages;
  const hasPrevPage = validPage > 1;

  return {
    success: true,
    payments: payments,
    pagination: {
      currentPage: validPage,
      totalPages,
      totalCount,
      limit: validLimit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? validPage + 1 : null,
      prevPage: hasPrevPage ? validPage - 1 : null
    },
    message: "Application payments fetched successfully"
  };
};

/**
 * Reconcile a user's open payments for an application directly with Razorpay.
 *
 * Fallback for when a webhook is delayed or never delivered: the frontend calls
 * this when the user returns from the payment page. Uses the same
 * applyPaymentStatus logic as the webhook, so outcomes are identical.
 * Only checks the few most recent open links to stay within Razorpay rate limits.
 */
const LINK_STATUS: Record<string, PaymentStatus | undefined> = {
  paid: "PAID",
  partially_paid: "ATTEMPTED",
  cancelled: "CANCELLED",
  expired: "CANCELLED",
};

export const syncApplicationPayments = async (userId: string, applicationId: string) => {
  const open = await Payment.find({
    user: userId,
    applicationId,
    paymentStatus: { $nin: ["PAID", "CANCELLED"] },
    orderId: { $regex: /^plink_/ },
  })
    .sort({ createdAt: -1 })
    .limit(3);

  const results: { paymentId: string; outcome: string; status?: string; error?: string }[] = [];
  for (const p of open) {
    try {
      const link: any = await razorpay.paymentLink.fetch(p.orderId);
      const status = LINK_STATUS[String(link?.status ?? "").toLowerCase()];
      if (!status) {
        results.push({ paymentId: String(p._id), outcome: "unchanged", status: p.paymentStatus });
        continue;
      }
      const captured = Array.isArray(link.payments)
        ? link.payments.find((x: any) => x?.status === "captured") ?? link.payments[0]
        : undefined;
      const result = await applyPaymentStatus({
        identifiers: {
          paymentLinkId: p.orderId,
          paymentId: captured?.payment_id,
          razorpayOrderId: link.order_id,
        },
        status,
        paidAt: captured?.created_at ? new Date(Number(captured.created_at) * 1000) : undefined,
        raw: { linkStatus: link.status, amountPaid: link.amount_paid, payments: link.payments },
        source: "sync",
      });
      results.push({ paymentId: String(p._id), outcome: result.outcome, status: result.status });
    } catch (err: any) {
      const message = err?.error?.description || err?.message || "Razorpay fetch failed";
      console.error("Payment sync failed", { paymentId: String(p._id), message });
      results.push({ paymentId: String(p._id), outcome: "error", error: message });
    }
  }

  const paid = await Payment.exists({ user: userId, applicationId, paymentStatus: "PAID" });
  return { paid: Boolean(paid), results };
};
