"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = exports.updateProfile = exports.getProfile = void 0;
const response_helper_1 = require("../common/helper/response.helper");
const profileService = __importStar(require("./profile.services"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
// GET /api/profiles/me
exports.getProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        console.log("No userId found in req.user");
        res.status(401).json((0, response_helper_1.createResponse)(null, "Unauthorized"));
        return;
    }
    const profile = yield profileService.getProfile(userId);
    res.json((0, response_helper_1.createResponse)(profile, "Profile retrieved successfully"));
}));
// PATCH or POST /api/profiles/update
exports.updateProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        console.log("No userId found in req.user");
        res.status(401).json((0, response_helper_1.createResponse)(null, "Unauthorized"));
        return;
    }
    const { phone, pancardNumber, dateOfBirth } = req.body;
    const updatedProfile = yield profileService.updateProfile(userId, {
        phone,
        pancardNumber,
        dateOfBirth
    });
    res.json((0, response_helper_1.createResponse)(updatedProfile, "Profile updated successfully"));
}));
exports.uploadImage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "No file uploaded"));
        return;
    }
    if (!req.user) {
        res.status(401).send((0, response_helper_1.createResponse)(null, "Unauthorized"));
        return;
    }
    const result = yield profileService.uploadPanimage(req.file, req.user._id);
    res.send((0, response_helper_1.createResponse)(result, "Image uploaded successfully"));
}));
