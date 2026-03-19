// src/controllers/timetables.controller.js
import Timetable from '../models/timetable.models.js';
import User from '../models/user.model.js';
import { Op } from 'sequelize';

//GET CURRENT UPCOMING TIMETABLE
export async function getCurrentTimetable(req, res, next) {
  try {
    const { from, to, days = '7', course, todayOnly } = req.query;

    const now = new Date();
    let rangeStart;
    let rangeEnd;

    // Build time window
    if (from || to) {
      rangeStart = from ? new Date(from) : new Date(new Date().setHours(0, 0, 0, 0));
      rangeEnd = to ? new Date(to) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else if (todayOnly === '1' || todayOnly === 'true') {
      rangeStart = new Date();
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd = new Date(rangeStart);
      rangeEnd.setDate(rangeEnd.getDate() + 1);
    } else {
      const nDays = Math.max(parseInt(days, 10) || 7, 1);
      rangeStart = now;
      rangeEnd = new Date(Date.now() + nDays * 24 * 60 * 60 * 1000);
    }

    // Overlap logic: begin < rangeEnd AND end >= rangeStart
    const where = {
      classBeginsAt: { [Op.lt]: rangeEnd },
      classEndsAt: { [Op.gte]: rangeStart },
    };

    if (course) {
      where.course = { [Op.like]: `%${course}%` };
    }

    const items = await Timetable.findAll({
      where,
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['classBeginsAt', 'ASC']],
    });

    return res.json({
      status: 'success',
      range: { from: rangeStart, to: rangeEnd },
      count: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

export async function upsertTimetable(req, res, next) {
  try {
    const { id, course, classBeginsAt, classEndsAt } = req.body;

 
    if (!course || !classBeginsAt || !classEndsAt) {
      return res.status(400).json({
        status: 'error',
        message: 'course, classBeginsAt, and classEndsAt are required',
      });
    }

    const start = new Date(classBeginsAt);
    const end = new Date(classEndsAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format (use ISO 8601 for classBeginsAt/classEndsAt)',
      });
    }
    if (end <= start) {
      return res.status(400).json({
        status: 'error',
        message: 'classEndsAt must be after classBeginsAt',
      });
    }

    // Check overlap for same course:
    // (begin < newEnd) AND (end > newStart)
    const overlapWhere = {
      course,
      [Op.and]: [
        { classBeginsAt: { [Op.lt]: end } },
        { classEndsAt: { [Op.gt]: start } },
      ],
    };

    // If updating, exclude the current id from overlap check
    if (id) {
      overlapWhere.id = { [Op.ne]: id };
    }

    const overlapping = await Timetable.findOne({ where: overlapWhere });

    // If an overlapping entry exists and this is a CREATE → update that record instead (upsert semantics)
    if (overlapping && !id) {
      await overlapping.update({
        classBeginsAt: start,
        classEndsAt: end,
        createdById: req.user.id,
        course,
      });

      return res.status(200).json({
        status: 'success',
        message: 'Existing overlapping timetable updated (upsert)',
        data: overlapping,
      });
    }

    // If id provided, update that specific row
    if (id) {
      const existing = await Timetable.findByPk(id);
      if (!existing) {
        return res.status(404).json({ status: 'error', message: 'Timetable not found' });
      }

 
      await existing.update({
        course,
        classBeginsAt: start,
        classEndsAt: end,
        createdById: req.user.id,
      });

      return res.json({ status: 'success', data: existing });
    }

    // Otherwise, create a new row
    const created = await Timetable.create({
      course,
      classBeginsAt: start,
      classEndsAt: end,
      createdById: req.user.id,
    });

    return res.status(201).json({ status: 'success', data: created });
  } catch (err) {
    next(err);
  }
}