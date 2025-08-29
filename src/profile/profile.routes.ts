import { Router } from "express";
import * as profileValidation from "./profile.validation"
import * as profileController from "./profile.controllers";
import { catchError } from "../common/middleware/catch-error";
import { roleAuth } from "../common/middleware/role-auth.middleware";
import multer from "multer";
const upload = multer();
const router = Router();

router 
        .get("/me", catchError, roleAuth(["USER", "ADMIN"]), profileController.getProfile)
        .post("/update", catchError, roleAuth(["USER", "ADMIN"]), profileValidation.updateProfile, profileController.updateProfile)
        .post("/upload-image", roleAuth(["USER", "ADMIN"]), upload.single("file"), profileController.uploadImage)
        .put("/update-image", roleAuth(["USER", "ADMIN"]), upload.single("file"), profileController.uploadImage);

export default router;