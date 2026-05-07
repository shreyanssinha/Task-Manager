const { body } = require('express-validator');

const createTaskRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('A task without a title isn\'t very useful')
    .isLength({ max: 200 })
    .withMessage('Title is way too long - keep it under 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description can\'t exceed 1000 characters'),
  body('dueDate')
    .notEmpty()
    .withMessage('When should this be done by?')
    .isISO8601()
    .withMessage('That date format looks off - use ISO 8601 (YYYY-MM-DD)'),
  body('assignee')
    .notEmpty()
    .withMessage('Someone needs to be responsible for this task')
    .isMongoId()
    .withMessage('The assignee ID doesn\'t look valid'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Pick a valid status: todo, in_progress, or done'),
];

const updateTaskRules = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('If you\'re changing the title, it can\'t be blank')
    .isLength({ max: 200 })
    .withMessage('Title maxes out at 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Keep the description under 1000 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Use a proper date format (ISO 8601)'),
  body('assignee')
    .optional()
    .isMongoId()
    .withMessage('That assignee ID format is wrong'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be one of: todo, in_progress, done'),
];

const updateStatusRules = [
  body('status')
    .notEmpty()
    .withMessage('What status should this task move to?')
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('That\'s not a valid status - choose todo, in_progress, or done'),
];

module.exports = { createTaskRules, updateTaskRules, updateStatusRules };
