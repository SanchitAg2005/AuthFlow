const express = require('express');
const taskController = require('../controllers/task.controller');
const validate = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema, taskIdSchema, queryTaskSchema } = require('../utils/schemas');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply session authentication to all task routes automatically
router.use(authenticateJWT);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Retrieve tasks
 *     description: Returns tasks owned by user. If logged in as Admin, returns all tasks across the system. Supports pagination, status filtering, and search.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of tasks per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, DONE]
 *         description: Filter tasks by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search tasks by title
 *     responses:
 *       200:
 *         description: Task array retrieved successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Complete project layout
 *               description:
 *                 type: string
 *                 example: Build high-fidelity directory hierarchies
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *                 example: TODO
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.route('/')
  .get(validate(queryTaskSchema), taskController.getAllTasks)
  .post(validate(createTaskSchema), taskController.createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Retrieve specific task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 24-character hexadecimal Mongoose ID
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       403:
 *         description: Forbidden (Not owned by request user)
 *       404:
 *         description: Task not found
 *   put:
 *     summary: Update specific task details
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 24-character hexadecimal Mongoose ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *   delete:
 *     summary: Delete specific task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 24-character hexadecimal Mongoose ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.route('/:id')
  .get(validate(taskIdSchema), taskController.getTaskById)
  .put(validate(updateTaskSchema), taskController.updateTask)
  .delete(validate(taskIdSchema), taskController.deleteTask);

module.exports = router;
