// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';


export const protect = async (req, res, next) => {
  try {
    const token = getAccessToken(req);
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'Not authorized: missing token' });
    }

    const secret = process.env.JWT_ACCESS_SECRET; 
    if (!secret) {
      return res.status(500).json({ status: 'error', message: 'Server auth misconfiguration' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Token is invalid';
      return res.status(401).json({ status: 'error', message: msg });
    }

    const user = await User.findByPk(decoded.sub);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User no longer exists' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      matricNumber: user.matricNumber,
      firstName: user.firstName,
      lastName: user.lastName
    };

    return next();
  } catch (error) {
    return next(error); 
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Role "${req.user.role}" is not authorized to access this route`
      });
    }
    return next();
  };
};