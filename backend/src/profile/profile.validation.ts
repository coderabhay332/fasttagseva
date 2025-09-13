const { body, checkExact } = require('express-validator');

export const updateProfile = checkExact([
    body('phone').isString().withMessage('Phone must be a string'),
    
    body('pancardNumber').isString().withMessage('Pancard Number must be a string'),
    body('dateOfBirth').isString().withMessage('Date of Birth must be a string'),
]);
