const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { projectRules, addMemberRules } = require('../validators/projectValidator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);

router.get('/', getProjects);
router.get('/:id', getProject);

router.post('/', role('admin'), projectRules, validate, createProject);
router.put('/:id', role('admin'), projectRules, validate, updateProject);
router.delete('/:id', role('admin'), deleteProject);

router.post('/:id/members', role('admin'), addMemberRules, validate, addMember);
router.delete('/:id/members/:userId', role('admin'), removeMember);

module.exports = router;
