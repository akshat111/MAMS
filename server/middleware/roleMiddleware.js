const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // If user role is not in the list of allowed roles, deny access
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. You do not have permission to access this resource." });
    }
    next();
  };
};

module.exports = authorizeRoles;
