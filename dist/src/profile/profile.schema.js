"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
const mongoose_1 = require("mongoose");
const profileSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    phone: { type: String, required: true },
    pancard: { type: String, required: true },
    pancardNumber: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
});
exports.Profile = (0, mongoose_1.model)("Profile", profileSchema);
