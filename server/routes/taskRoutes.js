const express = require('express');
const router = express.Router();
const {
  createTask,
  getProjectTasks,
  getMyTasks,
  getTaskStats,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const {
  createTaskRules,
  updateTaskRules,
  updateStatusRules,
} = require('../validators/taskValidator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);

router.get('/my', getMyTasks);
router.get('/stats', getTaskStats);

router.post('/projects/:id/tasks', role('admin'), createTaskRules, validate, createTask);
router.get('/projects/:id/tasks', getProjectTasks);

router.put('/:id', role('admin'), updateTaskRules, validate, updateTask);
router.patch('/:id/status', updateStatusRules, validate, updateTaskStatus);
router.delete('/:id', role('admin'), deleteTask);

module.exports = router;
