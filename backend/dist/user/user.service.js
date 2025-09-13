import mongoose from "mongoose";
import {} from "./user.dto";
import userSchema from "./user.schema";
import bcrypt from "bcrypt";
import { createUserTokens } from "../common/services/passport-jwt.services";
require('dotenv').config();
import jwt from "jsonwebtoken";
import { loadConfig } from "../common/helper/config.helper";
loadConfig();
export const generateRefreshToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};
export const createUser = async (data) => {
    const result = await userSchema.create({ ...data, active: true });
    return result.toObject();
};
export const updateUser = async (id, data) => {
    const result = await userSchema.findOneAndUpdate({ _id: id }, data, {
        new: true,
    });
    return result;
};
export const me = async (user) => {
    console.log("user", user._id);
    if (!user || !user._id) {
        throw new Error('User not authenticated');
    }
    const result = await userSchema.findById(user._id).select('-password').lean();
    if (!result) {
        throw new Error('User not found');
    }
    return result;
};
export const editUser = async (id, data) => {
    const result = await userSchema.findOneAndUpdate({ _id: id }, data);
    return result;
};
export const deleteUser = async (id) => {
    const result = await userSchema.deleteOne({ _id: id });
    return result;
};
export const getUserById = async (id) => {
    const result = await userSchema.findById(id).lean();
    return result;
};
export const getAllUser = async () => {
    const result = await userSchema.find({}).lean();
    return result;
};
export const login = async (email, password) => {
    const user = await userSchema.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret', { expiresIn: '7d' });
    user.refreshToken = refreshToken;
    await user.save();
    return user;
};
export const getUserByEmail = async (email, withPassword = false) => {
    if (withPassword) {
        const result = await userSchema.findOne({ email }).select('+password').lean();
        return result;
    }
};
export const updateUserToken = async (user, refreshToken) => {
    const result = await userSchema.findOneAndUpdate({ _id: user._id }, { refreshToken }, { new: true });
    return result;
};
export const refreshToken = async (user, refreshToken) => {
    if (!refreshToken)
        throw new Error("No refresh token provided");
    const userData = await userSchema.findOne({ refreshToken });
    if (!userData)
        throw new Error("Invalid refresh token");
    console.log("user", userData);
    const tokens = createUserTokens(userData);
    if (!tokens)
        throw new Error("Failed to create tokens");
    const newRefreshToken = tokens.refreshToken;
    const data = await userSchema.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });
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
};
//# sourceMappingURL=user.service.js.map