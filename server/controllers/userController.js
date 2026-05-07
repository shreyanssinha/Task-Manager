const User = require('../models/User');

const getUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find().select('name email role createdAt');
    res.json({ users: allUsers });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers };
