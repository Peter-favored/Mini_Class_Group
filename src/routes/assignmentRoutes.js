// src/routes/assignments.routes.js
import { Router } from 'express';
import { protect } from '../Middleware/authMiddleware.js';
import requireRole from '../Middleware/requiredRole.js';
import * as assignmentsCtrl from '../controllers/assignmentsController.js';

const asyncHandler = (fn) => (req, res, next) =>
     Promise.resolve(fn(req, res, next)).catch(next);
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Assignments
 *   description: Create and manage assignments (Class Rep); all students can view
 */

/**
 * @swagger
 * /assignments:
 *   get:
 *     tags: [Assignments]
 *     summary: List assignments (authenticated)
 *     responses:
 *       200:
 *         description: List of assignments
 */
router.get('/', protect, asyncHandler(assignmentsCtrl.listAssignments));

/**
 * @swagger
 * /assignments:
 *   post:
 *     tags: [Assignments]
 *     summary: Create assignment (Class Rep only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAssignmentRequest'
 *     responses:
 *       201:
 *         description: Assignment created
 */
router.post('/', protect, requireRole('classRep'), asyncHandler(assignmentsCtrl.createAssignment));

/**
 * @swagger
 * /assignments/{id}:
 *   get:
 *     tags: [Assignments]
 *     summary: Get assignment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Assignment details
 */
router.get('/:id', protect, asyncHandler(assignmentsCtrl.getAssignmentById));

/**
 * @swagger
 * /assignments/{id}:
 *   patch:
 *     tags: [Assignments]
 *     summary: Update assignment (Class Rep only)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch('/:id', protect, requireRole('classRep'), asyncHandler(assignmentsCtrl.updateAssignment));

/**
 * @swagger
 * /assignments/{id}:
 *   delete:
 *     tags: [Assignments]
 *     summary: Delete assignment (Class Rep only)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete('/:id', protect, requireRole('classRep'), asyncHandler(assignmentsCtrl.deleteAssignment));

export default router;