import { Router } from "express";
import * as deliveryController from "./delivery.controller";
import * as deliveryValidation from "./delivery.vallidation";
import { roleAuth } from "../common/middleware/role-auth.middleware";
import errorHandler from "../common/middleware/error.handler";

const router = Router();

router

.post("/create", roleAuth(["USER"]),errorHandler, (deliveryValidation.deliveryValidation), deliveryController.createDelivery)
.get("/get-delivery", roleAuth(["USER"]),errorHandler, deliveryController.getDelivery)
.put("/update-delivery", roleAuth(["USER"]),errorHandler, (deliveryValidation.deliveryValidation), deliveryController.updateDelivery)
;