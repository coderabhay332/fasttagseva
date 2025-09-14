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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController = __importStar(require("./user.controller"));
const userValidation = __importStar(require("./user.validaton"));
const passport_1 = __importDefault(require("passport"));
const multer_1 = __importDefault(require("multer"));
const role_auth_middleware_1 = require("../common/middleware/role-auth.middleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});
router.
    post("/create", userValidation.createUser, userController.createUser)
    .post("/login", userValidation.login, passport_1.default.authenticate('login', { session: false }), userController.login)
    .post("/refresh", userValidation.refreshToken, userController.refreshToken)
    .post("/forgot-password", userValidation.forgotPassword, userController.forgotPassword)
    .post("/reset-password", userValidation.resetPassword, userController.resetPassword)
    .post("/upload-image", (0, role_auth_middleware_1.roleAuth)(["USER", "ADMIN"]), upload.single("file"), userController.uploadImage)
    .get("/me", (0, role_auth_middleware_1.roleAuth)(["USER", "ADMIN"]), userController.me);
exports.default = router;
