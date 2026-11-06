const mongoose = require('mongoose');

const blockchainBlockSchema = new mongoose.Schema({
  blockNumber: {
    type: Number,
    required: [true, 'Block number is required'],
    unique: true,
  },
  hash: {
    type: String,
    required: [true, 'Block hash is required'],
  },
  previousHash: {
    type: String,
    required: [true, 'Previous hash is required'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LandRecord',
    default: null,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  nonce: {
    type: Number,
    default: 0,
  },
});

blockchainBlockSchema.index({ hash: 1 });

module.exports = mongoose.model('BlockchainBlock', blockchainBlockSchema);
