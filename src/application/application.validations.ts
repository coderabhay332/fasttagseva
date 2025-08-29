import { checkExact, body, param,  } from "express-validator";

export const createApplicationValidation = [
 body('vehicle').isString().notEmpty(),
 body('engineNumber').isString().notEmpty(),
 body('chasisNumber').isString().notEmpty()
];

export const updateStatusValidation = [
  body('id').isString().notEmpty(),
  body('status').isString().isIn(["NOT SUBMITTED", "PENDING", "AGENT ASSIGNED", "REJECTED", "DONE"]).withMessage('Invalid status')
];

export const updateApplicationValidation = [
  body('vehicle').isString().notEmpty(),
  body('engineNumber').isString().notEmpty(),
  body('chasisNumber').isString().notEmpty()
];

export const idParamValidation = [
  param('id').isString().notEmpty().isMongoId().withMessage('Invalid id')
];