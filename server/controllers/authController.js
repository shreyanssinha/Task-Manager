const jwt = require('jsonwebtoken');
const User = require('../models/User');

const mintToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const formatUserData = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const alreadyExists = await User.findOne({ email });
    if (alreadyExists) {
      return res.status(409).json({ message: 'That email is already tied to an existing account.' });
    }

    const newUser = await User.create({ name, email, password, role });
    const token = mintToken(newUser._id);

    res.status(201).json({
      message: 'Your account is all set!',
      token,
      user: formatUserData(newUser),
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Those credentials don\'t match our records.' });
    }

    const passwordCorrect = await user.comparePassword(password);
    if (!passwordCorrect) {
      return res.status(401).json({ message: 'Those credentials don\'t match our records.' });
    }

    const token = mintToken(user._id);

    res.json({
      message: 'You\'re in!',
      token,
      user: formatUserData(user),
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.json({ user: formatUserData(req.user) });
};

module.exports = { signup, login, getMe };
