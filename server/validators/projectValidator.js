const { body } = require('express-validator');

const projectRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Your project needs a title')
    .isLength({ max: 100 })
    .withMessage('Keep the title under 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description is getting too long - 500 char max'),
];

const addMemberRules = [
  body('userId')
    .notEmpty()
    .withMessage('Tell us which user to add')
    .isMongoId()
    .withMessage('That user ID isn\'t in a valid format'),
];

module.exports = { projectRules, addMemberRules };
