import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true }, // Razorpay order ID
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    paymentStatus: { 
      type: String, 
      enum: ["CREATED", "ATTEMPTED", "PAID", "FAILED", "CANCELLED"],
      default: "CREATED" 
    },
    paymentLink: { type: String },
    paymentId: { type: String }, // Razorpay payment ID (available after successful payment)
    paymentSessionId: { type: String }, // Our payment reference, also sent in Razorpay link notes (paymentRef)
    razorpayOrderId: { type: String }, // Razorpay order_xxx backing the payment link
    response: { type: mongoose.Schema.Types.Mixed }, // Raw Razorpay response
    lastEvent: { type: mongoose.Schema.Types.Mixed }, // Last webhook/sync snapshot that touched this payment
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    bankName: { type: String },
    paymentMethod: { 
      type: String, 
      enum: ["CARD", "NET_BANKING", "UPI", "WALLET", "EMI", "OTHER"],
      default: "CARD" 
    },
    // Link to application
    paymentDate: { type: Date }, // When the payment was completed
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
