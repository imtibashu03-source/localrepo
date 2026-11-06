const mongoose = require('mongoose');

const featuresSchema = new mongoose.Schema(
  {
    failedLogins: { type: Number, default: 0 },
    accessFrequency: { type: Number, default: 0 },
    ipMismatch: { type: Number, default: 0 },
    modificationAttempts: { type: Number, default: 0 },
    offHoursAccess: { type: Number, default: 0 },
    geoAnomalies: { type: Number, default: 0 },
    unusualPatterns: { type: Number, default: 0 },
    sessionDuration: { type: Number, default: 0 },
  },
  { _id: false }
);

const threatLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  ipAddress: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
  threatLevel: {
    type: String,
    enum: ['safe', 'low', 'medium', 'high'],
    required: [true, 'Threat level is required'],
  },
  threatScore: {
    type: Number,
    min: 0,
    max: 100,
    required: [true, 'Threat score is required'],
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  features: {
    type: featuresSchema,
    default: () => ({}),
  },
  recommendation: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

threatLogSchema.index({ userId: 1, timestamp: -1 });
threatLogSchema.index({ threatLevel: 1, timestamp: -1 });

module.exports = mongoose.model('ThreatLog', threatLogSchema);
