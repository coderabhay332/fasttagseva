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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_errors_1 = __importDefault(require("http-errors"));
const roleAuth = (roles, publicRoutes = []) => (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    if (publicRoutes.includes(req.path)) {
        next();
        return;
    }
    const token = (_b = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "")) !== null && _b !== void 0 ? _b : (_c = req.cookies) === null || _c === void 0 ? void 0 : _c.accessToken;
    if (!token) {
        throw (0, http_errors_1.default)(401, {
            message: `Invalid token`,
        });
    }
    // Access tokens are signed with JWT_ACCESS_SECRET (see createUserTokens).
    // Verification MUST use the same secret, otherwise every protected route
    // rejects valid tokens whenever the two secrets differ.
    const accessSecret = (_d = process.env.JWT_ACCESS_SECRET) !== null && _d !== void 0 ? _d : process.env.JWT_SECRET;
    if (!accessSecret) {
        throw (0, http_errors_1.default)(500, {
            message: "Server misconfiguration: JWT access secret is not set",
        });
    }
    try {
        const decodedUser = jsonwebtoken_1.default.verify(token, accessSecret);
        req.user = decodedUser;
    }
    catch (err) {
        throw (0, http_errors_1.default)(401, {
            message: "Invalid token",
        });
    }
    const user = req.user;
    if (user.role == null || !["ADMIN", "USER"].includes(user.role)) {
        throw (0, http_errors_1.default)(401, { message: "Invalid user role" });
    }
    if (!roles.includes(user.role)) {
        const type = user.role.slice(0, 1) + user.role.slice(1).toLocaleLowerCase();
        throw (0, http_errors_1.default)(401, {
            message: `${type} can not access this resource`,
        });
    }
    next();
}));
exports.roleAuth = roleAuth;
