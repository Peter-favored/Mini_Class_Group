import { validationResult } from 'express-validator';

export function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map(e => ({
    field: e.path,
    message: e.msg
  }));

  return res.status(400).json({
    status: 'error',
    message: 'Validation error',
    errors
  });
}