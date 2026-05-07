const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${err.message}`);

  if (err.name === 'ValidationError') {
    const fieldErrors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Some fields didn\'t pass validation', errors: fieldErrors });
  }

  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `A record with that ${duplicateField} already exists.` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'That ID doesn\'t look right. Please double-check and try again.' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Something went wrong on our end',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
