"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const applicationSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    vehicle: { type: String, required: true },
    chasisNumber: { type: String, required: true },
    engineNumber: { type: String, required: true },
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
const Application = mongoose_1.default.model("Application", applicationSchema);
exports.Application = Application;
