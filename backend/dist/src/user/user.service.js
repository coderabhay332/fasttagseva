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
exports.uploadUserImage = exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.updateUserToken = exports.getUserByEmail = exports.login = exports.getAllUser = exports.getUserById = exports.deleteUser = exports.editUser = exports.me = exports.updateUser = exports.createUser = exports.generateRefreshToken = void 0;
const user_schema_1 = __importDefault(require("./user.schema"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_jwt_services_1 = require("../common/services/passport-jwt.services");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_helper_1 = require("../common/helper/config.helper");
const email_services_1 = __importDefault(require("../common/services/email.services"));
const cloudinary_services_1 = require("../common/services/cloudinary.services");
(0, config_helper_1.loadConfig)();
const generateRefreshToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};
exports.generateRefreshToken = generateRefreshToken;
const createUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.default.create(Object.assign(Object.assign({}, data), { active: true }));
    return result.toObject();
});
exports.createUser = createUser;
const updateUser = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.default.findOneAndUpdate({ _id: id }, data, {
        new: true,
    });
    return result;
});
exports.updateUser = updateUser;
const me = (user) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("user", user._id);
    if (!user || !user._id) {
        throw new Error('User not authenticated');
    }
    const result = yield user_schema_1.default.findById(user._id).select('-password').lean();
    if (!result) {
        throw new Error('User not found');
    }
    return result;
});
exports.me = me;
const editUser = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.default.findOneAndUpdate({ _id: id }, data);
    return result;
});
exports.editUser = editUser;
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.default.deleteOne({ _id: id });
    return result;
});
exports.deleteUser = deleteUser;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.default.findById(id).lean();
    return result;
});
exports.getUserById = getUserById;
const getAllUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.default.find({}).lean();
    return result;
});
exports.getAllUser = getAllUser;
const login = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret', { expiresIn: '7d' });
    user.refreshToken = refreshToken;
    yield user.save();
    return user;
});
exports.login = login;
const getUserByEmail = (email, withPassword = false) => __awaiter(void 0, void 0, void 0, function* () {
    if (withPassword) {
        const result = yield user_schema_1.default.findOne({ email }).select('+password').lean();
        return result;
    }
});
exports.getUserByEmail = getUserByEmail;
const updateUserToken = (user, refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.default.findOneAndUpdate({ _id: user._id }, { refreshToken }, { new: true });
    return result;
});
exports.updateUserToken = updateUserToken;
const refreshToken = (user, refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (!refreshToken)
        throw new Error("No refresh token provided");
    const userData = yield user_schema_1.default.findOne({ refreshToken });
    if (!userData)
        throw new Error("Invalid refresh token");
    console.log("user", userData);
    const tokens = (0, passport_jwt_services_1.createUserTokens)(userData);
    if (!tokens)
        throw new Error("Failed to create tokens");
    const newRefreshToken = tokens.refreshToken;
    const data = yield user_schema_1.default.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });
    console.log("data", data);
    return {
        accessToken: tokens.accessToken,
        refreshToken: newRefreshToken,
        user: {
            _id: user._id,
            email: user.email,
            name: user.name,
        },
    };
});
exports.refreshToken = refreshToken;
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }
    try {
        const resetToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_RESET_PASSWORD_SECRET, { expiresIn: '1h' });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        // Send email with reset link
        yield (0, email_services_1.default)(user.email, "Password Reset", `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`);
        return { message: 'Password reset email sent' };
    }
    catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error('Failed to send password reset email');
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_RESET_PASSWORD_SECRET);
        const user = yield user_schema_1.default.findById(decoded.id);
        if (!user) {
            throw new Error('Invalid token or user not found');
        }
        user.password = newPassword;
        yield user.save();
        // Optionally invalidate refresh token on password reset
        yield user_schema_1.default.findByIdAndUpdate(user._id, { refreshToken: undefined });
        return { message: 'Password reset successful' };
    }
    catch (error) {
        console.error('Error resetting password:', error);
        throw new Error('Invalid or expired token');
    }
});
exports.resetPassword = resetPassword;
const uploadUserImage = (file, userId) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.uploadUserImage = uploadUserImage;
