// src/controllers/submissions.controller.js
import Submission from '../models/submission.models.js';
import Assignment from '../models/assignments.models.js';
import User from '../models/user.model.js';
import { Op } from 'sequelize';

//submit assignment(student)
export async function submit(req, res, next) {
  try {
    const { assignmentId, note } = req.body;
    const studentId = req.user.id; // from protect() middleware

    // 1. Check if assignment exists
    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assignment not found'
      });
    }

    // 2. Ensure file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'File is required'
      });
    }

    // 3. Prevent multiple submissions by same student
    const existing = await Submission.findOne({
      where: { assignmentId, studentId }
    });

    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already submitted this assignment'
      });
    }

    // 4. Create submission
    const submission = await Submission.create({
      assignmentId,
      studentId,
      note,
      filePath: `/uploads/${req.file.filename}`,
      submittedAt: new Date()
    });

    return res.status(201).json({
      status: 'success',
      message: 'Assignment submitted successfully',
      data: submission
    });

  } catch (err) {
    next(err);
  }
}

//list submissions for an assignment (classRep only)
export async function listByAssignment(req, res, next) {
  try {
    const { assignmentId } = req.query;

    if (!assignmentId) {
      return res.status(400).json({
        status: 'error',
        message: 'assignmentId query parameter is required'
      });
    }

    // Ensure assignment exists
    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assignment not found'
      });
    }

    const submissions = await Submission.findAll({
      where: { assignmentId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email', 'matricNumber']
        }
      ],
      order: [['submittedAt', 'ASC']]
    });

    return res.json({
      status: 'success',
      total: submissions.length,
      data: submissions
    });

  } catch (err) {
    next(err);
  }
}


//get my submissions(students)
export async function mySubmissions(req, res, next) {
  try {
    const studentId = req.user.id;

    const submissions = await Submission.findAll({
      where: { studentId },
      include: [
        {
          model: Assignment,
          as: 'assignment',
          attributes: ['id', 'title', 'deadline']
        }
      ],
      order: [['submittedAt', 'DESC']]
    });

    return res.json({
      status: 'success',
      total: submissions.length,
      data: submissions
    });

  } catch (err) {
    next(err);
  }
}