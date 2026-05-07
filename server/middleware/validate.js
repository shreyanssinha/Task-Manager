const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const formattedErrors = result.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));

    return res.status(400).json({
      message: 'Please fix the following issues and try again',
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = validate;
