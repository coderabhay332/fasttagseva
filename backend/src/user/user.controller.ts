import * as userService from "./user.service.js";
import { createResponse } from "../common/helper/response.helper";
import asyncHandler from "express-async-handler";
import { type Request, type Response } from "express";
import { createUserTokens } from "../common/services/passport-jwt.services";
import { IUser } from "./user.dto";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.createUser(req.body);
  res.send(createResponse(result, "User created sucssefully"));
});
export const me = asyncHandler(async (req: Request, res: Response) => {
  console.log("req.user", req.user);
  const result = await userService.me(req.user as IUser);
  res.send(createResponse(result, "User fetched sucssefully"));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.updateUser(req.params.id, req.body);
  res.send(createResponse(result, "User updated sucssefully"));
});

export const editUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.editUser(req.params.id, req.body);
  res.send(createResponse(result, "User updated sucssefully"));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.deleteUser(req.params.id);
  res.send(createResponse(result, "User deleted sucssefully"));
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getUserById(req.params.id);
  res.send(createResponse(result));
});

export const getAllUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getAllUser();
  res.send(createResponse(result));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const tokens = createUserTokens(req.user as IUser)
  const updateUserToken = await userService.updateUserToken(req.user as IUser, tokens.refreshToken)
  res.send(createResponse({...tokens, user: req.user}, "Login successful"))
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await userService.refreshToken(req.user as IUser, req.body.refreshToken);
    res.send(createResponse(result, "Token refreshed successfully"));
  } catch (error: any) {
    console.error("Refresh token error:", error.message);
    res.status(401).send(createResponse(null, "Invalid refresh token"));
  }
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.forgotPassword(req.body.email);
  res.send(createResponse(result, "Password reset email sent"));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.resetPassword(req.body.token, req.body.password);
  res.send(createResponse(result, "Password has been reset successfully"));
});

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
      res.status(400).send(createResponse(null, "No file uploaded"));
      return;
  }
  if(!req.user) {
     res.status(401).send(createResponse(null, "Unauthorized"));
     return;
  }

  const result = await userService.uploadUserImage(req.file, req.user._id as string);
  res.send(createResponse(result, "Image uploaded successfully"));
});