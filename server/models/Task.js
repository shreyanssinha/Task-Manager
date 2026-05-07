const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Give this task a name so people know what to do'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    dueDate: {
      type: Date,
      required: [true, 'Set a deadline so we can track progress'],
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Every task needs someone to own it'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Tasks must belong to a project'],
    },
  },
  { timestamps: true }
);

taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ project: 1 });

module.exports = mongoose.model('Task', taskSchema);
