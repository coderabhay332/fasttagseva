"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamValidation = exports.updateApplicationValidation = exports.updateStatusValidation = exports.createApplicationValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createApplicationValidation = [
    (0, express_validator_1.body)('vehicle').isString().notEmpty(),
    (0, express_validator_1.body)('engineNumber').isString().notEmpty(),
    (0, express_validator_1.body)('chasisNumber').isString().notEmpty()
];
exports.updateStatusValidation = [
    (0, express_validator_1.body)('id').isString().notEmpty(),
    (0, express_validator_1.body)('status').isString().isIn(["NOT SUBMITTED", "PENDING", "AGENT ASSIGNED", "REJECTED", "DONE"]).withMessage('Invalid status')
];
exports.updateApplicationValidation = [
    (0, express_validator_1.body)('vehicle').isString().notEmpty(),
    (0, express_validator_1.body)('engineNumber').isString().notEmpty(),
    (0, express_validator_1.body)('chasisNumber').isString().notEmpty()
];
exports.idParamValidation = [
    (0, express_validator_1.param)('id').isString().notEmpty().isMongoId().withMessage('Invalid id')
];
