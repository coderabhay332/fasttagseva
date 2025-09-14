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
exports.uploadImage = exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.login = exports.getAllUser = exports.getUserById = exports.deleteUser = exports.editUser = exports.updateUser = exports.me = exports.createUser = void 0;
const userService = __importStar(require("./user.service.js"));
const response_helper_1 = require("../common/helper/response.helper");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const passport_jwt_services_1 = require("../common/services/passport-jwt.services");
exports.createUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.createUser(req.body);
    res.send((0, response_helper_1.createResponse)(result, "User created sucssefully"));
}));
exports.me = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("req.user", req.user);
    const result = yield userService.me(req.user);
    res.send((0, response_helper_1.createResponse)(result, "User fetched sucssefully"));
}));
exports.updateUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.updateUser(req.params.id, req.body);
    res.send((0, response_helper_1.createResponse)(result, "User updated sucssefully"));
}));
exports.editUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.editUser(req.params.id, req.body);
    res.send((0, response_helper_1.createResponse)(result, "User updated sucssefully"));
}));
exports.deleteUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.deleteUser(req.params.id);
    res.send((0, response_helper_1.createResponse)(result, "User deleted sucssefully"));
}));
exports.getUserById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.getUserById(req.params.id);
    res.send((0, response_helper_1.createResponse)(result));
}));
exports.getAllUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.getAllUser();
    res.send((0, response_helper_1.createResponse)(result));
}));
exports.login = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokens = (0, passport_jwt_services_1.createUserTokens)(req.user);
    const updateUserToken = yield userService.updateUserToken(req.user, tokens.refreshToken);
    res.send((0, response_helper_1.createResponse)(Object.assign(Object.assign({}, tokens), { user: req.user }), "Login successful"));
}));
exports.refreshToken = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield userService.refreshToken(req.user, req.body.refreshToken);
        res.send((0, response_helper_1.createResponse)(result, "Token refreshed successfully"));
    }
    catch (error) {
        console.error("Refresh token error:", error.message);
        res.status(401).send((0, response_helper_1.createResponse)(null, "Invalid refresh token"));
    }
}));
exports.forgotPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.forgotPassword(req.body.email);
    res.send((0, response_helper_1.createResponse)(result, "Password reset email sent"));
}));
exports.resetPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.resetPassword(req.body.token, req.body.password);
    res.send((0, response_helper_1.createResponse)(result, "Password has been reset successfully"));
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
    const result = yield userService.uploadUserImage(req.file, req.user._id);
    res.send((0, response_helper_1.createResponse)(result, "Image uploaded successfully"));
}));
