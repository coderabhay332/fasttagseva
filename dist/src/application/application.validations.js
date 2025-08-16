"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApplicationValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createApplicationValidation = [
    (0, express_validator_1.body)('vehicle').isString().notEmpty(),
    (0, express_validator_1.body)('chesisNumber').isString().notEmpty()
];
