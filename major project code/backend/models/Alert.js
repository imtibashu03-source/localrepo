const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['warning', 'critical', 'highRisk'],
    required: [true, 'Alert type is required'],
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LandRecord',
    default: null,
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

alertSchema.index({ userId: 1, isResolved: 1, createdAt: -1 });
alertSchema.index({ type: 1, isResolved: 1 });

module.exports = mongoose.model('Alert', alertSchema);
