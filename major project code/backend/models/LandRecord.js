const mongoose = require('mongoose');

const ownershipHistorySchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    transferDate: {
      type: Date,
      required: true,
    },
    transferHash: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const landRecordSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    surveyNumber: {
      type: String,
      required: [true, 'Survey number is required'],
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    district: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    area: {
      type: Number,
      default: 0,
    },
    areaUnit: {
      type: String,
      enum: ['acres', 'hectares', 'sqft'],
      default: 'acres',
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    ownershipHistory: {
      type: [ownershipHistorySchema],
      default: [],
    },
    blockchainHash: {
      type: String,
      default: null,
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'transferred', 'disputed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Index for search performance
landRecordSchema.index({ ownerName: 'text', surveyNumber: 'text', location: 'text', district: 'text' });
landRecordSchema.index({ district: 1, state: 1, status: 1 });

module.exports = mongoose.model('LandRecord', landRecordSchema);
