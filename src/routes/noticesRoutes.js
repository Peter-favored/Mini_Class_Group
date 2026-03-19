// src/routes/notices.routes.js
import { Router } from 'express';
import { protect } from '../Middleware/authMiddleware.js';
import requireRole from '../Middleware/requiredRole.js';
import * as noticesCtrl from '../controllers/noticesController.js';

const asyncHandler = (fn) => (req, res, next) => 
    Promise.resolve(fn(req, res, next)).catch(next);
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notices
 *   description: Announcements created by Class Rep; viewable by authenticated users
 */

/**
 * @swagger
 * /notices:
 *   get:
 *     tags: [Notices]
 *     summary: List notices (authenticated)
 *     responses:
 *       200:
 *         description: List of notices
 */
router.get('/', protect, asyncHandler(noticesCtrl.listNotices));

/**
 * @swagger
 * /notices:
 *   post:
 *     tags: [Notices]
 *     summary: Create a new notice (Class Rep only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNoticeRequest'
 *     responses:
 *       201:
 *         description: Notice created
 *       403:
 *         description: Forbidden (not classRep)
 */
router.post('/', protect, requireRole('classRep'), asyncHandler(noticesCtrl.createNotice));

/**
 * @swagger
 * /notices/{id}:
 *   patch:
 *     tags: [Notices]
 *     summary: Update a notice (Class Rep only)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch('/:id', protect, requireRole('classRep'), asyncHandler(noticesCtrl.updateNotice));

/**
 * @swagger
 * /notices/{id}:
 *   delete:
 *     tags: [Notices]
 *     summary: Delete a notice (Class Rep only)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete('/:id', protect, requireRole('classRep'), asyncHandler(noticesCtrl.deleteNotice));

export default router;