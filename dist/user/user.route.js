import { Router } from "express";
import asyncHandler from "express-async-handler";
import * as userController from "./user.controller";
import * as userValidation from "./user.validaton";
import passport from "passport";
import { roleAuth } from "../common/middleware/role-auth.middleware";
const router = Router();
router.
    post("/create", userValidation.createUser, userController.createUser)
    .post("/login", userValidation.login, passport.authenticate('login', { session: false }), userController.login)
    .post("/refresh", userValidation.refreshToken, userController.refreshToken)
    .get("/me", roleAuth(["USER", "admin"]), userController.me);
export default router;
//# sourceMappingURL=user.route.js.map