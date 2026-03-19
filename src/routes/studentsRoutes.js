// src/routes/students.routes.js
import { Router } from 'express';
import { protect } from '../Middleware/authMiddleware.js';
import requireRole from '../Middleware/requiredRole.js';
import * as studentsCtrl from '../controllers/studentsController.js';

const asyncHandler = (fn) => (req, res, next) => 
    Promise.resolve(fn(req, res, next)).catch(next);
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student biodata search/filter (Class Rep only)
 */

/**
 * @swagger
 * /students:
 *   get:
 *     tags: [Students]
 *     summary: Search students (Class Rep only)
 *     parameters:
 *       - in: query
 *         name: query
 *         schema: { type: string }
 *       - in: query
 *         name: department
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated student list
 */
router.get('/', protect, requireRole('classRep'), asyncHandler(studentsCtrl.searchStudents));

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     tags: [Students]
 *     summary: Get a student by ID (Class Rep only)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Student detail
 */
router.get('/:id', protect, requireRole('classRep'), asyncHandler(studentsCtrl.getStudentById));

export default router;