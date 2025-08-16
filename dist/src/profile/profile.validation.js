"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = void 0;
const { body, checkExact } = require('express-validator');
exports.updateProfile = checkExact([
    body('phone').isString().withMessage('Phone must be a string'),
    body('pancardNumber').isString().withMessage('Pancard Number must be a string'),
    body('dateOfBirth').isString().withMessage('Date of Birth must be a string'),
]);
