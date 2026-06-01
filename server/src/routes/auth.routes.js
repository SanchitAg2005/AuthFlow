const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/schemas');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { authRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alex Mercer
 *               email:
 *                 type: string
 *                 example: alex@example.com
 *               password:
 *                 type: string
 *                 example: Password123!

 *     responses:
 *       201:
 *         description: User account created successfully
 *       400:
 *         description: Validation error or duplicate email
 */
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate credentials and login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: alex@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Retrieve active user session profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User session active and profile retrieved
 *       401:
 *         description: Unauthorized session token
 */
router.get('/me', authenticateJWT, authController.getMe);

module.exports = router;
