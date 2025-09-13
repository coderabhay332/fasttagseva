import Razorpay from "razorpay";
import Payment from "./payment.schema";
import userSchema from "../user/user.schema";
import crypto from 'crypto';

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
  bankName: string
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

  console.log("Creating payment with params:", {
    amount,
    customerName,
    customerEmail: customerEmail.substring(0, 3) + "...", // Log partial email for privacy
    customerPhone: customerPhone.substring(0, 3) + "...", // Log partial phone for privacy
    userId,
    hasBaseUrl: !!process.env.BASE_URL
  });

  try {
    const amountInPaise = Math.round(amount * 100);
    const receiptId = `pl_${Date.now()}`;

    // ✅ Create Razorpay Payment Link
    console.log("Calling Razorpay API with payload:", {
      amount: amountInPaise,
      currency: "INR",
      description: `Payment for ${customerName}`
    });
    
    const paymentLink = await razorpay.paymentLink.create({
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
        customerPhone
      },
      callback_url: `${process.env.FRONTEND_BASE_URL || process.env.BASE_URL}/upload-documents/${applicationId}`,
      callback_method: 'get'
    });

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
      response: paymentLink,
      user: userId,
      applicationId: applicationId,
      bankName: bankName
    });

    await userSchema.findByIdAndUpdate(
      userId,
      { $addToSet: { payment: paymentDoc._id } },
      { new: true }
    );

    return {
      success: true,
      payment: {
        paymentId: paymentDoc._id,
        orderId: paymentLink.id,
        amount,
        currency: "INR",
        paymentStatus: paymentLink.status,
        paymentUrl: paymentLink.short_url,
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
    .select('amount customerName customerEmail customerPhone paymentStatus createdAt applicationId orderId paymentId bankName')
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
    .select('amount customerName customerEmail customerPhone paymentStatus paymentDate createdAt orderId paymentId bankName')
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