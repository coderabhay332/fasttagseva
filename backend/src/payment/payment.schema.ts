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
    paymentSessionId: { type: String }, // Receipt ID from Razorpay
    response: { type: mongoose.Schema.Types.Mixed }, // Raw Razorpay response
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    bankName: { type: String },
    // Link to application
    paymentDate: { type: Date }, // When the payment was completed
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
