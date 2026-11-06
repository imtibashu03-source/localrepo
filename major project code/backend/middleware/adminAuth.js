const auth = require('./auth');

const adminAuth = async (req, res, next) => {
  // First run the standard JWT auth check
  await new Promise((resolve) => {
    auth(req, res, () => resolve());
  });

  // If response was already sent by auth middleware (i.e., auth failed), stop here
  if (res.headersSent) return;

  // Check admin role
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      data: null,
    });
  }

  next();
};

module.exports = adminAuth;
