"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const applicationSchema = new mongoose_1.default.Schema({
    vehicle: { type: String, required: true },
    chesisNumber: { type: String, required: true },
    status: {
        type: String,
        enum: ["NOT SUBMITTED", "PENDING", "AGENT ASSIGNED", "REJECTED", "DONE"],
        default: "NOT SUBMITTED"
    },
});
const Application = mongoose_1.default.model("Application", applicationSchema);
exports.Application = Application;
