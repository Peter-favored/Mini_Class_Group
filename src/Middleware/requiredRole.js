const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Role "${req.user.role}" is not authorized to access this route`
      });
    }

    
    return next();
  };
};

export default requireRole;