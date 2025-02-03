import { body } from 'express-validator';


// Input validation middleware
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
];