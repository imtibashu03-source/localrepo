const User = require('../models/User');
const LandRecord = require('../models/LandRecord');
const BlockchainBlock = require('../models/BlockchainBlock');
const Transaction = require('../models/Transaction');
const Alert = require('../models/Alert');
const ThreatLog = require('../models/ThreatLog');

// ─── Get Dashboard Stats ──────────────────────────────────────────────────────
/**
 * GET /api/admin/stats
 */
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalRecords,
      activeRecords,
      totalBlocks,
      totalTransactions,
      totalAlerts,
      unresolvedAlerts,
      threatDistribution,
      recentTransactions,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      LandRecord.countDocuments(),
      LandRecord.countDocuments({ status: 'active' }),
      BlockchainBlock.countDocuments(),
      Transaction.countDocuments(),
      Alert.countDocuments(),
      Alert.countDocuments({ isResolved: false }),
      ThreatLog.aggregate([
        { $group: { _id: '$threatLevel', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Transaction.find()
        .sort({ timestamp: -1 })
        .limit(5)
        .populate('userId', 'name email')
        .populate('recordId', 'ownerName surveyNumber'),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Admin statistics retrieved successfully.',
      data: {
        users: { total: totalUsers, active: activeUsers, inactive: totalUsers - activeUsers },
        records: { total: totalRecords, active: activeRecords },
        blockchain: { totalBlocks },
        transactions: { total: totalTransactions },
        alerts: { total: totalAlerts, unresolved: unresolvedAlerts, resolved: totalAlerts - unresolvedAlerts },
        threatDistribution: threatDistribution.map((t) => ({ level: t._id, count: t.count })),
        recentActivity: recentTransactions,
      },
    });
  } catch (error) {
    console.error('getStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving admin statistics.',
      data: null,
    });
  }
};

// ─── Get Users ────────────────────────────────────────────────────────────────
/**
 * GET /api/admin/users?page=1&limit=10&role=user&search=...
 */
const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving users.',
      data: null,
    });
  }
};

// ─── Update User ──────────────────────────────────────────────────────────────
/**
 * PUT /api/admin/users/:id
 * Body: { role?, isActive?, loginAttempts? }
 */
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        data: null,
      });
    }

    // Prevent admin from demoting themselves
    if (user._id.toString() === req.user._id.toString() && req.body.role && req.body.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role.',
        data: null,
      });
    }

    const allowedUpdates = ['role', 'isActive', 'loginAttempts'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: { user },
    });
  } catch (error) {
    console.error('updateUser error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid user ID.', data: null });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error updating user.',
      data: null,
    });
  }
};

// ─── Delete User ──────────────────────────────────────────────────────────────
/**
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
        data: null,
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        data: null,
      });
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
      data: { deletedId: req.params.id },
    });
  } catch (error) {
    console.error('deleteUser error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid user ID.', data: null });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error deleting user.',
      data: null,
    });
  }
};

// ─── Get System Logs ──────────────────────────────────────────────────────────
/**
 * GET /api/admin/logs?page=1&limit=20&type=...
 */
const getSystemLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.userId) filter.userId = req.query.userId;

    const [logs, total] = await Promise.all([
      Transaction.find(filter)
        .populate('userId', 'name email role')
        .populate('recordId', 'ownerName surveyNumber district status')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'System logs retrieved successfully.',
      data: {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('getSystemLogs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving system logs.',
      data: null,
    });
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  getSystemLogs,
};
