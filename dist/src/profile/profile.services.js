"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPanimage = exports.updateProfile = exports.getProfile = void 0;
const profile_schema_1 = require("./profile.schema");
const cloudinary_services_1 = require("../common/services/cloudinary.services");
const getProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield profile_schema_1.Profile.findOne({ userId });
    return profile;
});
exports.getProfile = getProfile;
const updateProfile = (userId, profileData) => __awaiter(void 0, void 0, void 0, function* () {
    const updated = yield profile_schema_1.Profile.findOneAndUpdate({ userId }, Object.assign({ userId }, profileData), { new: true, upsert: true });
    console.log("Profile upserted result:", updated);
    return updated;
});
exports.updateProfile = updateProfile;
const uploadPanimage = (file, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file)
        throw new Error("No file provided for upload");
    const userFolder = `users/${userId}/`;
    try {
        const result = yield (0, cloudinary_services_1.uploadImage)(file, userFolder);
        return { url: result };
    }
    catch (error) {
        console.error("Error uploading image:", error);
        throw new Error('Failed to upload image');
    }
});
exports.uploadPanimage = uploadPanimage;
