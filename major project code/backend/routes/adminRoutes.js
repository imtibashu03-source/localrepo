const express = require('express');
const router = express.Router();
const { getStats, getUsers, updateUser, deleteUser, getSystemLogs } = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// All routes require admin authentication
router.use(adminAuth);

// GET    /api/admin/stats         — dashboard statistics
router.get('/stats', getStats);

// GET    /api/admin/users         — paginated user list
router.get('/users', getUsers);

// PUT    /api/admin/users/:id     — update user role/status
router.put('/users/:id', updateUser);

// DELETE /api/admin/users/:id     — delete a user
router.delete('/users/:id', deleteUser);

// GET    /api/admin/logs          — system transaction logs
router.get('/logs', getSystemLogs);

module.exports = router;
