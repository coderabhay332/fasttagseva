import { checkExact, body, param,  } from "express-validator";
import { SERVICE_TYPES } from "./application.schema";

export const createApplicationValidation = [
 body('serviceType').optional().isString().isIn(SERVICE_TYPES as unknown as string[]).withMessage('Invalid service type'),
 body('vehicle').isString().notEmpty(),
 body('engineNumber').optional().isString(),
 body('chasisNumber').optional().isString(),
 body('notes').optional().isString()
];

export const updateStatusValidation = [
  body('id').isString().notEmpty(),
  body('status').isString().isIn(["NOT SUBMITTED", "PENDING", "AGENT ASSIGNED", "REJECTED", "DONE"]).withMessage('Invalid status')
];

export const updateApplicationValidation = [
  body('serviceType').optional().isString().isIn(SERVICE_TYPES as unknown as string[]).withMessage('Invalid service type'),
  body('vehicle').optional().isString().notEmpty(),
  body('engineNumber').optional().isString(),
  body('chasisNumber').optional().isString(),
  body('notes').optional().isString()
];

export const idParamValidation = [
  param('id').isString().notEmpty().isMongoId().withMessage('Invalid id')
];