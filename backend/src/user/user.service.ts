import mongoose from "mongoose";
import { type IUser } from "./user.dto";
import userSchema from "./user.schema";
import bcrypt from "bcrypt";
import { createUserTokens } from "../common/services/passport-jwt.services";
import jwt from "jsonwebtoken";
import { loadConfig } from "../common/helper/config.helper";
import sendEmail from "../common/services/email.services";
import cloudinary from "../common/config/cloudinary.config";
import { uploadImage } from "../common/services/cloudinary.services";
loadConfig();

export const generateRefreshToken = (id: string, role: string): string => {
    return jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" });
  };  




export const createUser = async (data: IUser) => {
  const result = await userSchema.create({ ...data, active: true });
  return result.toObject();
};

export const updateUser = async (id: string, data: IUser) => {
  const result = await userSchema.findOneAndUpdate({ _id: id }, data, {
    new: true,
  });
  return result;
};

export const me = async (user: IUser) => {
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

export const editUser = async (id: string, data: Partial<IUser>) => {
  const result = await userSchema.findOneAndUpdate({ _id: id }, data);
  return result;
};

export const deleteUser = async (id: string) => {
  const result = await userSchema.deleteOne({ _id: id });
  return result;
};

export const getUserById = async (id: string) => {
  const result = await userSchema.findById(id).lean();
  return result;
};

export const getAllUser = async () => {
  const result = await userSchema.find({}).lean();
  return result;
};

export const login = async (email: string, password: string) => {
  const user = await userSchema.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: '7d' }
  );
  user.refreshToken = refreshToken;
  await user.save();

  return user;
};


export const getUserByEmail = async (email: string, withPassword = false) => {
  if (withPassword) {
      const result = await userSchema.findOne({ email }).select('+password').lean();
      return result;
  }
};

export const updateUserToken = async (user: IUser, refreshToken: string) => {
  const result = await userSchema.findOneAndUpdate(
    { _id: user._id },
    { refreshToken },
    { new: true }
  );
  return result;
};

export const refreshToken = async (user: IUser, refreshToken: string) => {
  if (!refreshToken) throw new Error("No refresh token provided");

  const userData = await userSchema.findOne({ refreshToken });
  if (!userData) throw new Error("Invalid refresh token");
  console.log("user", userData);
  const tokens = createUserTokens(userData as IUser);
  if (!tokens) throw new Error("Failed to create tokens");
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


export const forgotPassword = async (email: string) => {
  const user = await userSchema.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  try {
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_RESET_PASSWORD_SECRET as string, { expiresIn: '1h' });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send email with reset link
    await sendEmail(user.email, "Password Reset", `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`);

    return { message: 'Password reset email sent' };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error('Failed to send password reset email');
  }
  
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_RESET_PASSWORD_SECRET as string) as { id: string };
    const user = await userSchema.findById(decoded.id);
    if (!user) {
      throw new Error('Invalid token or user not found');
    }
    user.password = newPassword;
    await user.save();
    // Optionally invalidate refresh token on password reset
    await userSchema.findByIdAndUpdate(user._id, { refreshToken: undefined });
    return { message: 'Password reset successful' };
  } catch (error) {
    console.error('Error resetting password:', error);
    throw new Error('Invalid or expired token');
  }
};

export const uploadUserImage = async (file: Express.Multer.File, userId: string) => {
  if (!file) throw new Error("No file provided for upload");

  const userFolder = `users/${userId}/`;

  try {
    const result: string = await uploadImage(file, userFolder);
    return { url: result };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error('Failed to upload image');
  }
}