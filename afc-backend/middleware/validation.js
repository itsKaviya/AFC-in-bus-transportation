const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return sendError(res, 422, 'Validation failed', errorMessages);
  }
  next();
};

const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('rfidUID').trim().notEmpty().withMessage('RFID UID is required').isLength({ min: 4, max: 50 }).withMessage('RFID UID must be 4-50 characters'),
  validate
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const rechargeValidation = [
  body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  validate
];

const tapInValidation = [
  body('rfidUID').trim().notEmpty().withMessage('RFID UID is required'),
  body('lat').notEmpty().withMessage('Latitude is required').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('lng').notEmpty().withMessage('Longitude is required').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  validate
];

const tapOutValidation = [
  body('rfidUID').trim().notEmpty().withMessage('RFID UID is required'),
  body('lat').notEmpty().withMessage('Latitude is required').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('lng').notEmpty().withMessage('Longitude is required').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  validate
];

module.exports = {
  signupValidation,
  loginValidation,
  rechargeValidation,
  tapInValidation,
  tapOutValidation
};
