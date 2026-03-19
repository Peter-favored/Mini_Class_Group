// src/routes/auth.routes.js
import { Router } from 'express';
import { body, param } from 'express-validator';
import { handleValidation } from '../Middleware/validate.js';
import { protect } from '../Middleware/authMiddleware.js';
import requireRole from '../Middleware/requiredRole.js';
import * as authCtrl from '../controllers/authController.js';

// Simple async error wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Create router instance
const router = Router();


//validation rules
const registerRules = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('firstName must be 2–50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('lastName must be 2–50 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email required'),
  body('matricNumber')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('matricNumber must be 3–30 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email')
    .isEmail()
    .withMessage('Valid email required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const forgotRules = [
  body('email')
    .isEmail()
    .withMessage('Valid email required'),
];

const resetRules = [
  param('token')
    .isString()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// swagger tags
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication (register, login, password reset)
 */


//ROUTES
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (must be pre-authorized)
 *     tags: [Auth]
 *     security: []   # public route
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized (matricNumber/email not preloaded)
 */
router.post(
  '/register',
  registerRules,
  handleValidation,
  asyncHandler(authCtrl.register)
);


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and receive JWT access token
 *     tags: [Auth]
 *     security: []   # public route
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  loginRules,
  handleValidation,
  asyncHandler(authCtrl.login)
);


/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent (if the user exists)
 */
router.post(
  '/forgot-password',
  forgotRules,
  handleValidation,
  asyncHandler(authCtrl.forgotPassword)
);


/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using token sent by email
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password successfully reset
 *       400:
 *         description: Invalid or expired token
 */
router.post(
  '/reset-password/:token',
  resetRules,
  handleValidation,
  asyncHandler(authCtrl.resetPassword)
);


/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns current user details
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/me',
  protect,
  asyncHandler(authCtrl.getMe)
);


/**
 * @swagger
 * /auth/classrep-only:
 *   get:
 *     summary: Route accessible only by class rep
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authorized
 *       403:
 *         description: Forbidden (not classRep)
 */
router.get(
  '/classrep-only',
  protect,
  requireRole('classRep'),
  (req, res) => {
    res.json({
      status: 'success',
      message: 'You have class rep access',
      user: req.user,
    });
  }
);

export default router;