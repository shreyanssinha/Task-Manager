const Project = require('../models/Project');
const Task = require('../models/Task');

const createProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(201).json({ message: 'Project is ready to go!', project });
  } catch (err) {
    next(err);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : { members: req.user._id };

    const projects = await Project.find(filter)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (err) {
    next(err);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'We couldn\'t find a project with that ID.' });
    }

    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (req.user.role !== 'admin' && !isMember) {
      return res.status(403).json({ message: 'You don\'t have access to this project.' });
    }

    res.json({ project });
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'That project doesn\'t seem to exist anymore.' });
    }

    res.json({ message: 'Project details saved.', project });
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'No project found with that ID.' });
    }

    await Task.deleteMany({ project: req.params.id });

    res.json({ message: 'Project and all its associated tasks have been removed.' });
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Can\'t find that project.' });
    }

    const alreadyOnTeam = project.members.some((m) => m.toString() === userId);
    if (alreadyOnTeam) {
      return res.status(409).json({ message: 'This person is already a member of the project.' });
    }

    project.members.push(userId);
    await project.save();

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.json({ message: 'New team member added!', project });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'The project creator can\'t be removed from their own project.' });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.json({ message: 'Team member removed from the project.', project });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
