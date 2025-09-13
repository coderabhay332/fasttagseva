import { Router } from "express";
import asyncHandler from "express-async-handler";
import * as userController from "./user.controller";
import * as userValidation from "./user.validaton";
import passport from "passport";
import multer from "multer";

import { roleAuth } from "../common/middleware/role-auth.middleware";
const router = Router();
const upload = multer();

router.
  post("/create", userValidation.createUser, userController.createUser)
  .post("/login", userValidation.login, passport.authenticate('login', { session: false }), userController.login)
  .post("/refresh", userValidation.refreshToken, userController.refreshToken)
  .post("/forgot-password", userValidation.forgotPassword, userController.forgotPassword)
  .post("/reset-password", userValidation.resetPassword, userController.resetPassword)
  .post("/upload-image", roleAuth(["USER", "ADMIN"]), upload.single("file"), userController.uploadImage)
  .get("/me", roleAuth(["USER", "ADMIN"]), userController.me);


export default router;
