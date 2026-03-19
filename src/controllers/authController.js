// src/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model.js';
import AuthorizedStudent from '../models/authorizedStudents.js'; 
import { sendResetPasswordEmail } from '../services/emailService.js';


// Helper: sign JWT
function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
}

//register
export async function register(req, res, next) {
  try {
    const { firstName, lastName, email, matricNumber, password } = req.body;

    // Check if authorized to register
    const authorized = await AuthorizedStudent.findOne({
      where: { email, matricNumber }
    });

    if (!authorized) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to register. Contact your Class Rep or Admin.'
      });
    }

    // Check for duplicate user
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: 'This email is already registered.'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user (role defaults to 'student')
    const user = await User.create({
      firstName,
      lastName,
      email,
      matricNumber,
      passwordHash,
      role: 'student'
    });

    const token = signAccessToken(user);

    return res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          matricNumber: user.matricNumber
        },
        tokens: { accessToken: token }
      }
    });
  } catch (err) {
    next(err);
  }
}

//login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    const token = signAccessToken(user);

    return res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          matricNumber: user.matricNumber
        },
        tokens: { accessToken: token }
      }
    });
  } catch (err) {
    next(err);
  }
}


//Forgot password
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    // Always respond success to avoid email enumeration attacks
    if (!user) {
      return res.json({
        status: 'success',
        message: 'If this email exists, a reset link has been sent'
      });
    }

    // Create reset token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetTokenHash = tokenHash;
    user.resetTokenExpiresAt = expiresAt;
    await user.save();

    await sendResetPasswordEmail(user.email, rawToken);

    return res.json({
      status: 'success',
      message: 'Reset link sent to your email'
    });
  } catch (err) {
    next(err);
  }
}


//reset password
export async function resetPassword(req, res, next) {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired token' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    user.passwordHash = passwordHash;
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    await user.save();

    return res.json({
      status: 'success',
      message: 'Password reset successful'
    });
  } catch (err) {
    next(err);
  }
}

// get logged in user
export async function getMe(req, res) {
  return res.json({
    status: 'success',
    data: req.user
  });
}