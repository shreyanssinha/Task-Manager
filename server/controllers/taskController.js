const Task = require('../models/Task');
const Project = require('../models/Project');

const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, assignee, status } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'The project you\'re trying to add a task to doesn\'t exist.' });
    }

    const assigneeIsMember = project.members.some((m) => m.toString() === assignee);
    if (!assigneeIsMember) {
      return res.status(400).json({ message: 'You can only assign tasks to people who are members of this project.' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      assignee,
      status: status || 'todo',
      project: projectId,
    });

    await task.populate('assignee', 'name email');
    await task.populate('project', 'title');

    res.status(201).json({ message: 'Task has been created and assigned.', task });
  } catch (err) {
    next(err);
  }
};

const getProjectTasks = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'That project doesn\'t exist.' });
    }

    const hasAccess =
      req.user.role === 'admin' ||
      project.members.some((m) => m.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'You\'re not part of this project.' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'name email')
      .populate('project', 'title')
      .sort({ dueDate: 1 });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('assignee', 'name email')
      .populate('project', 'title')
      .sort({ dueDate: 1 });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

const getTaskStats = async (req, res, next) => {
  try {
    const scope = req.user.role === 'admin' ? {} : { assignee: req.user._id };

    const [total, completed, inProgress, todo, overdue] = await Promise.all([
      Task.countDocuments(scope),
      Task.countDocuments({ ...scope, status: 'done' }),
      Task.countDocuments({ ...scope, status: 'in_progress' }),
      Task.countDocuments({ ...scope, status: 'todo' }),
      Task.countDocuments({
        ...scope,
        status: { $ne: 'done' },
        dueDate: { $lt: new Date() },
      }),
    ]);

    res.json({
      stats: {
        total,
        completed,
        inProgress,
        todo,
        overdue,
        pending: total - completed,
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, assignee, status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate, assignee, status },
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email')
      .populate('project', 'title');

    if (!task) {
      return res.status(404).json({ message: 'Couldn\'t find that task. It may have been deleted.' });
    }

    res.json({ message: 'Task details have been updated.', task });
  } catch (err) {
    next(err);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'That task doesn\'t exist.' });
    }

    const isAssignee = task.assignee.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isAssignee) {
      return res.status(403).json({ message: 'You can only update the status of tasks assigned to you.' });
    }

    task.status = status;
    await task.save();

    await task.populate('assignee', 'name email');
    await task.populate('project', 'title');

    res.json({ message: 'Task status changed.', task });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'That task was already gone or never existed.' });
    }
    res.json({ message: 'Task permanently deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  getMyTasks,
  getTaskStats,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
