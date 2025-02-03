import { body } from 'express-validator';

// Input validation middleware
export const validateRegistration = [
  body('fullName')
    .trim()
    .isLength({ min: 4 })
    .withMessage('Full name must be at least 4 characters long'),
  body('phoneNumber')
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
    .withMessage('Password must contain at least one number, one uppercase and one lowercase letter')
];