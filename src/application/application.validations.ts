import { checkExact, body,  } from "express-validator";

export const createApplicationValidation = [
 body('vehicle').isString().notEmpty(),
 body('engineNumber').isString().notEmpty(),
 body('chasisNumber').isString().notEmpty()
];

export const updateStatusValidation = [
  body('status').isString().isIn(["NOT SUBMITTED", "PENDING", "AGENT ASSIGNED", "REJECTED", "DONE"]).withMessage('Invalid status')
];

export const updateApplicationValidation = [
  body('vehicle').isString().notEmpty(),
  body('engineNumber').isString().notEmpty(),
  body('chasisNumber').isString().notEmpty()
];