const { body } = require('express-validator');

const signupRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('We need your name to set up your account')
    .isLength({ max: 50 })
    .withMessage('Name can\'t be longer than 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('An email address is required')
    .isEmail()
    .withMessage('That doesn\'t look like a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Pick a password for your account')
    .isLength({ min: 6 })
    .withMessage('Use at least 6 characters for security'),
  body('role')
    .optional()
    .isIn(['admin', 'member'])
    .withMessage('Role has to be either admin or member'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Enter your email to sign in')
    .isEmail()
    .withMessage('That doesn\'t look like a valid email'),
  body('password').notEmpty().withMessage('Your password is required to sign in'),
];

module.exports = { signupRules, loginRules };
