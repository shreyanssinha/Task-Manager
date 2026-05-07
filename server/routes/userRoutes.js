const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('admin'), getUsers);

module.exports = router;
