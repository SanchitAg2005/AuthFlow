const taskService = require('../services/task.service');
const catchAsync = require('../utils/catchAsync');

exports.createTask = catchAsync(async (req, res, next) => {
  const task = await taskService.createTask(req.body, req.user._id);

  res.status(201).json({
    status: 'success',
    data: {
      task
    }
  });
});

exports.getAllTasks = catchAsync(async (req, res, next) => {
  const { tasks, pagination } = await taskService.getAllTasks(req.user, req.query);

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    pagination,
    data: {
      tasks
    }
  });
});

exports.getTaskById = catchAsync(async (req, res, next) => {
  const task = await taskService.getTaskById(req.params.id, req.user);

  res.status(200).json({
    status: 'success',
    data: {
      task
    }
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user);

  res.status(200).json({
    status: 'success',
    data: {
      task
    }
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  await taskService.deleteTask(req.params.id, req.user);

  res.status(200).json({
    status: 'success',
    message: 'Task successfully deleted'
  });
});
