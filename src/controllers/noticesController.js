// src/controllers/notices.controller.js
import Notice from '../models/notices.model.js';
import User from '../models/user.model.js';

//list notices(by any logged in user)
export async function listNotices(req, res, next) {
  try {
    const notices = await Notice.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'classRep',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    return res.json({
      status: 'success',
      count: notices.length,
      data: notices
    });
  } catch (err) {
    next(err);
  }
}


//create notice (class rep only)
export async function createNotice(req, res, next) {
  try {
    const { title, description, date } = req.body;

    // req.user comes from protect middleware
    const classRepId = req.user.id;

    const notice = await Notice.create({
      title,
      description,
      date,
      classRepId
    });

    return res.status(201).json({
      status: 'success',
      data: notice
    });
  } catch (err) {
    next(err);
  }
}



//update notice(class rep only)
export async function updateNotice(req, res, next) {
  try {
    const { id } = req.params;

    const notice = await Notice.findByPk(id);

    if (!notice) {
      return res.status(404).json({
        status: 'error',
        message: 'Notice not found'
      });
    }

    // Only the creator (classRep) can update it
    if (notice.classRepId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to update this notice'
      });
    }

    const { title, description, date } = req.body;

    await notice.update({
      title: title ?? notice.title,
      description: description ?? notice.description,
      date: date ?? notice.date
    });

    return res.json({
      status: 'success',
      data: notice
    });
  } catch (err) {
    next(err);
  }
}



//Delete notices (by the class rep only)
export async function deleteNotice(req, res, next) {
  try {
    const { id } = req.params;

    const notice = await Notice.findByPk(id);

    if (!notice) {
      return res.status(404).json({
        status: 'error',
        message: 'Notice not found'
      });
    }

    // Only the creator can delete
    if (notice.classRepId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to delete this notice'
      });
    }

    await notice.destroy();

    return res.json({
      status: 'success',
      message: 'Notice deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}