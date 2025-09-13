import { Router } from "express";
import * as deliveryController from "./delivery.controller";
import * as deliveryValidation from "./delivery.validation";
import { roleAuth } from "../common/middleware/role-auth.middleware";
import errorHandler from "../common/middleware/error.handler";

const router = Router();

router
  .post("/create", roleAuth(["USER"]), deliveryValidation.deliveryValidation, deliveryController.createDelivery)
  .get("/get-delivery", roleAuth(["USER"]), deliveryController.getDelivery)
  .put("/update-delivery", roleAuth(["USER"]), deliveryValidation.deliveryValidation, deliveryController.updateDelivery);

export default router;