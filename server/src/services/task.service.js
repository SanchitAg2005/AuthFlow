const Task = require('../models/task.model');
const AppError = require('../errors/AppError');

exports.createTask = async (taskData, userId) => {
  const task = await Task.create({
    ...taskData,
    owner: userId
  });
  return task;
};

exports.getAllTasks = async (user, queryParams = {}) => {
  const { page = 1, limit = 10, status, search } = queryParams;
  const query = {};

  // Ownership scope constraint
  if (user.role !== 'admin') {
    query.owner = user._id;
  }

  // Filtering by status
  if (status) {
    query.status = status;
  }

  // Text search on title
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  // Pagination calculation
  const skip = (page - 1) * limit;

  const dbQuery = Task.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (user.role === 'admin') {
    dbQuery.populate('owner', 'name email role');
  }

  const tasks = await dbQuery;
  const total = await Task.countDocuments(query);

  return {
    tasks,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

exports.getTaskById = async (taskId, user) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  // RBAC Ownership check: admin or owner can retrieve
  if (user.role !== 'admin' && task.owner.toString() !== user._id.toString()) {
    throw new AppError('You do not have permission to access this resource', 403, 'FORBIDDEN');
  }

  return task;
};

exports.updateTask = async (taskId, updateData, user) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  // RBAC Ownership check: admin or owner can modify
  if (user.role !== 'admin' && task.owner.toString() !== user._id.toString()) {
    throw new AppError('You do not have permission to modify this resource', 403, 'FORBIDDEN');
  }

  // Set updated fields dynamically
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined) {
      task[key] = updateData[key];
    }
  });

  await task.save();
  return task;
};

exports.deleteTask = async (taskId, user) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  // RBAC Ownership check: admin or owner can delete
  if (user.role !== 'admin' && task.owner.toString() !== user._id.toString()) {
    throw new AppError('You do not have permission to delete this resource', 403, 'FORBIDDEN');
  }

  await Task.findByIdAndDelete(taskId);
  return task;
};
