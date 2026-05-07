const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { signupRules, loginRules } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

router.post('/signup', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);
router.get('/me', auth, getMe);

module.exports = router;
