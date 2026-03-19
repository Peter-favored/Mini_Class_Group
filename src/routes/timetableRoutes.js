// src/routes/timetables.routes.js
import { Router } from 'express';
import { protect } from '../Middleware/authMiddleware.js';
import requireRole from '../Middleware/requiredRole.js';
import * as timetablesCtrl from '../controllers/timetableController.js';

const asyncHandler = (fn) => (req, res, next) => 
    Promise.resolve(fn(req, res, next)).catch(next);
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Timetables
 *   description: Manage and view timetables
 */

/**
 * @swagger
 * /timetables/current:
 *   get:
 *     tags: [Timetables]
 *     summary: Get the current timetable (authenticated)
 *     responses:
 *       200:
 *         description: Current timetable
 */
router.get('/current', protect, asyncHandler(timetablesCtrl.getCurrentTimetable));

/**
 * @swagger
 * /timetables:
 *   post:
 *     tags: [Timetables]
 *     summary: Create/Update a timetable (Class Rep only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Timetable'
 *     responses:
 *       201:
 *         description: Timetable saved
 */
router.post('/', protect, requireRole('classRep'), asyncHandler(timetablesCtrl.upsertTimetable));

export default router;