import { Router } from "express";
import * as applicationController from "./application.controllers";
import * as applicationValidation from "./application.validations";
import { catchError } from "../common/middleware/catch-error";
import { roleAuth } from "../common/middleware/role-auth.middleware";
import { createApplication } from "./application.controllers";
import { updateStatusValidation } from "./application.validations";

const router = Router();

router
  .post("/create", roleAuth(["USER", "ADMIN"]), catchError, applicationValidation.createApplicationValidation, applicationController.createApplication)
  .put("/update/:id", roleAuth(["USER", "ADMIN"]), catchError, applicationValidation.updateApplicationValidation, applicationController.updateApplication)
  .get("/", roleAuth(["ADMIN"]), applicationController.getAllApplications)
  .get("/my-application", roleAuth(["USER"]), applicationController.getAllApplicationsForUser)
  .post("/update-status", roleAuth(["ADMIN"]), catchError, applicationValidation.updateStatusValidation, applicationController.updateStatus)
  .delete("/:id", roleAuth(["USER", "ADMIN"]), catchError, applicationController.deleteApplication)
  .get("/:id", roleAuth(["USER", "ADMIN"]), catchError, applicationController.getApplicationById);
export default router;