import mongoose from "mongoose";

// Services offered by FASTagSeva. The simplified onboarding asks the customer
// to pick one of these; staff handle fulfilment afterwards.
export const SERVICE_TYPES = [
  "NEW_FASTAG",
  "REPLACEMENT_FASTAG",
  "COMMERCIAL_FASTAG",
  "KYC_KYV",
  "ANNUAL_PASS",
  "BLACKLIST_HOTLIST",
  "VRN_UPDATE",
  "E_NOTICE",
  "TAG_CLOSURE",
] as const;

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // What the customer is asking for. Optional for backward compatibility with
  // applications created before the simplified flow existed.
  serviceType: { type: String, enum: SERVICE_TYPES, required: false },
  vehicle: { type: String, required: true },
  // Engine/chassis are no longer collected in the simplified flow, so they are
  // optional now. Legacy records keep whatever they already had.
  chasisNumber: { type: String, required: false },
  engineNumber: { type: String, required: false },
  // Free-text request detail (e.g. VRN to update, reason for closure).
  notes: { type: String, required: false },
  status: {
    type: String,
    enum: ["NOT SUBMITTED", "PENDING", "AGENT ASSIGNED", "REJECTED", "DONE"],
    default: "NOT SUBMITTED"
  },
  rcImage: { type: String, required: false },
  panImage: { type: String, required: false },
  vehicleFrontImage: { type: String, required: false },
  vehicleSideImage: { type: String, required: false }
}, { timestamps: true });

const Application = mongoose.model("Application", applicationSchema);

export { Application };