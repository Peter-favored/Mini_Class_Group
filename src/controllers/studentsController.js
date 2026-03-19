// src/controllers/students.controller.js
import User from '../models/user.model.js';
import { Op } from 'sequelize';

//search students(classrep only)
export async function searchStudents(req, res, next) {
  try {
    const {
      query = "",
      department,
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const perPage = parseInt(limit) || 20;
    const offset = (pageNum - 1) * perPage;

    // Search conditions
    const where = {
      role: 'student', // ensures only students
      [Op.or]: [
        { firstName: { [Op.like]: `%${query}%` } },
        { lastName: { [Op.like]: `%${query}%` } },
        { email: { [Op.like]: `%${query}%` } },
        { matricNumber: { [Op.like]: `%${query}%` } }
      ]
    };

    if (department) {
      where.department = department;
    }

    // Query DB
    const { rows, count } = await User.findAndCountAll({
      where,
      limit: perPage,
      offset,
      order: [['firstName', 'ASC']]
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


//Get a single student (class rep only)
export async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;

    const student = await User.findOne({
      where: {
        id,
        role: 'student' // ensures it's actually a student
      }
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    return res.json({
      status: 'success',
      data: student
    });

  } catch (err) {
    next(err);
  }
}