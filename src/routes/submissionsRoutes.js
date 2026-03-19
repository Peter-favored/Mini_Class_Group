// src/routes/submissions.routes.js
import { Router } from 'express';
import { protect } from '../Middleware/authMiddleware.js';
import requireRole from '../Middleware/requiredRole.js';
import * as submissionsCtrl from '../controllers/submissionsController.js';
import { upload } from '../config/multer.js'; // multer config for file uploads

const asyncHandler = (fn) => (req, res, next) =>
     Promise.resolve(fn(req, res, next)).catch(next);
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Students submit assignments; Class Rep can list/collate
 */

/**
 * @swagger
 * /submissions:
 *   post:
 *     tags: [Submissions]
 *     summary: Submit an assignment file (student)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               assignmentId: { type: integer }
 *               note: { type: string }
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Submission created
 */
router.post(
  '/',
  protect,
  upload.single('file'),
  asyncHandler(submissionsCtrl.submit)
);

/**
 * @swagger
 * /submissions:
 *   get:
 *     tags: [Submissions]
 *     summary: List submissions for an assignment (Class Rep only)
 *     parameters:
 *       - in: query
 *         name: assignmentId
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: List of submissions
 */
router.get('/', protect, requireRole('classRep'), asyncHandler(submissionsCtrl.listByAssignment));

/**
 * @swagger
 * /submissions/me:
 *   get:
 *     tags: [Submissions]
 *     summary: Get my submissions (student)
 *     responses:
 *       200:
 *         description: My submissions
 */
router.get('/me', protect, asyncHandler(submissionsCtrl.mySubmissions));

export default router;