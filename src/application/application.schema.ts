import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vehicle: { type: String, required: true },
  chasisNumber: { type: String, required: true },
  engineNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ["NOT SUBMITTED", "PENDING", "AGENT ASSIGNED", "REJECTED", "DONE"],
    default: "NOT SUBMITTED"
  },
});

const Application = mongoose.model("Application", applicationSchema);

export { Application };