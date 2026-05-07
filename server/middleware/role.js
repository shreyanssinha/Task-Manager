const role = (...permitted) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Please log in before trying to access this resource.' });
    }

    if (!permitted.includes(req.user.role)) {
      return res.status(403).json({
        message: `Sorry, this action is restricted to ${permitted.join(' or ')} users.`,
      });
    }

    next();
  };
};

module.exports = role;
