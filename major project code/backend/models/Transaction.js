const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['create', 'update', 'delete', 'transfer', 'verify'],
    required: [true, 'Transaction type is required'],
  },
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LandRecord',
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  blockHash: {
    type: String,
    default: null,
  },
  previousHash: {
    type: String,
    default: null,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

transactionSchema.index({ recordId: 1, timestamp: -1 });
transactionSchema.index({ userId: 1, timestamp: -1 });
transactionSchema.index({ type: 1, timestamp: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
