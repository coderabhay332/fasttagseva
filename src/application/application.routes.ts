import { Router } from "express";
import * as applicationController from "./application.controllers";
import * as applicationValidation from "./application.validations";
import { catchError } from "../common/middleware/catch-error";
import { roleAuth } from "../common/middleware/role-auth.middleware";
import { createApplication } from "./application.controllers";
import { updateStatusValidation } from "./application.validations";
import multer from "multer";
const router = Router();
const upload = multer();


router
  .post("/create", roleAuth(["USER", "ADMIN"]), applicationValidation.createApplicationValidation, catchError, applicationController.createApplication)
  .put("/update/:id", roleAuth(["USER", "ADMIN"]), applicationValidation.idParamValidation, applicationValidation.updateApplicationValidation, catchError, applicationController.updateApplication)
  .get("/", roleAuth(["ADMIN"]), applicationController.getAllApplications)
  .get("/my-application", roleAuth(["USER"]), applicationController.getAllApplicationsForUser)
  .put("/update-status", roleAuth(["ADMIN"]), applicationValidation.updateStatusValidation, catchError, applicationController.updateStatus)
  .post("/upload-rc/:id", roleAuth(["USER", ]), applicationValidation.idParamValidation, catchError, upload.single("file"), applicationController.uploadRc)
  .post("/upload-vehicle-front/:id", roleAuth(["USER"]), applicationValidation.idParamValidation, catchError,upload.single("file"), applicationController.uploadVehicleFront)
  .post("/upload-vehicle-side/:id", roleAuth(["USER"]), applicationValidation.idParamValidation, catchError, upload.single("file"), applicationController.uploadVehicleSideImage)
  .post("/upload-pan/:id", roleAuth(["USER"]), applicationValidation.idParamValidation, catchError, upload.single("file"), applicationController.uploadPanImage)
  .delete("/:id", roleAuth([ "ADMIN"]), applicationValidation.idParamValidation, catchError, applicationController.deleteApplication)
  .get("/:id", roleAuth(["USER", "ADMIN"]), applicationValidation.idParamValidation, catchError, applicationController.getApplicationById);
export default router;