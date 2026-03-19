// src/controllers/assignments.controller.js
import { Op } from 'sequelize';
import Assignment from '../models/assignments.models.js';
import User from '../models/user.model.js';

// lists assignment (authenticated; students and class reps)
export async function listAssignments(req, res, next) {
  try {
    const {
      query = '',
      upcoming,            // "1" or "true" to filter only future deadlines
      page = 1,
      limit = 20,
      orderBy = 'deadline', // 'deadline' | 'createdAt'
      order = 'ASC'         // 'ASC' | 'DESC'
    } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const offset = (pageNum - 1) * perPage;

    const where = {};
    if (query) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ];
    }
    if (upcoming === '1' || upcoming === 'true') {
      where.deadline = { [Op.gte]: new Date() };
    }

    // Order whitelist
    const orderField = ['deadline', 'createdAt'].includes(orderBy) ? orderBy : 'deadline';
    const orderDir = (String(order).toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

    const { rows, count } = await Assignment.findAndCountAll({
      where,
      limit: perPage,
      offset,
      order: [[orderField, orderDir]],
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    return res.json({
      status: 'success',
      total: count,
      page: pageNum,
      pages: Math.ceil(count / perPage),
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

//create assignment (class rep only)
export async function createAssignment(req, res, next) {
  try {
    const { title, description, deadline } = req.body;

    // Basic inline guard (you can add express-validator later)
    if (!title || !description || !deadline) {
      return res.status(400).json({
        status: 'error',
        message: 'title, description and deadline are required'
      });
    }

    const createdById = req.user.id; // from protect middleware

    const assignment = await Assignment.create({
      title,
      description,
      deadline,
      createdById
    });

    return res.status(201).json({
      status: 'success',
      data: assignment
    });
  } catch (err) {
    next(err);
  }
}

//get assignment by ID (authenticated)
export async function getAssignmentById(req, res, next) {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    if (!assignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assignment not found'
      });
    }

    return res.json({
      status: 'success',
      data: assignment
    });
  } catch (err) {
    next(err);
  }
}

//update assignment (only classrep can update)
export async function updateAssignment(req, res, next) {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assignment not found'
      });
    }

    // Only the creator can update
    if (assignment.createdById !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to update this assignment'
      });
    }

    const { title, description, deadline } = req.body;

    await assignment.update({
      title: (title ?? assignment.title),
      description: (description ?? assignment.description),
      deadline: (deadline ?? assignment.deadline)
    });

    return res.json({
      status: 'success',
      data: assignment
    });
  } catch (err) {
    next(err);
  }
}


// delete assignment (classRep only and must be the creator)
export async function deleteAssignment(req, res, next) {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assignment not found'
      });
    }

    // Only the creator can delete
    if (assignment.createdById !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to delete this assignment'
      });
    }

    await assignment.destroy();

    return res.json({
      status: 'success',
      message: 'Assignment deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}