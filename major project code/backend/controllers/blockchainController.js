const BlockchainBlock = require('../models/BlockchainBlock');
const { validateChain, verifyRecord: verifyRecordUtil } = require('../utils/blockchain');

// ─── Get Full Chain ───────────────────────────────────────────────────────────
/**
 * GET /api/blockchain/chain
 */
const getChain = async (req, res) => {
  try {
    const chain = await BlockchainBlock.find()
      .sort({ blockNumber: 1 })
      .populate('recordId', 'ownerName surveyNumber status');

    const validation = validateChain(chain.map((b) => b.toObject()));

    return res.status(200).json({
      success: true,
      message: 'Blockchain retrieved successfully.',
      data: {
        chain,
        length: chain.length,
        isValid: validation.valid,
        validationMessage: validation.message,
      },
    });
  } catch (error) {
    console.error('getChain error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving blockchain.',
      data: null,
    });
  }
};

// ─── Verify Record by Hash ────────────────────────────────────────────────────
/**
 * GET /api/blockchain/verify/:hash
 */
const verifyRecord = async (req, res) => {
  try {
    const { hash } = req.params;

    if (!hash || hash.length !== 64) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hash. A valid SHA-256 hash (64 hex characters) is required.',
        data: null,
      });
    }

    const chain = await BlockchainBlock.find().sort({ blockNumber: 1 });

    if (chain.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blockchain is empty.',
        data: null,
      });
    }

    const result = verifyRecordUtil(hash, chain.map((b) => b.toObject()));

    if (!result.found) {
      return res.status(404).json({
        success: false,
        message: result.message,
        data: null,
      });
    }

    // Populate the block's record if available
    let populatedBlock = result.block;
    if (result.block.recordId) {
      const blockDoc = await BlockchainBlock.findOne({ hash }).populate('recordId', 'ownerName surveyNumber location district status');
      if (blockDoc) populatedBlock = blockDoc;
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        found: result.found,
        chainValid: result.chainValid,
        block: populatedBlock,
      },
    });
  } catch (error) {
    console.error('verifyRecord error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error verifying record.',
      data: null,
    });
  }
};

// ─── Get Single Block ─────────────────────────────────────────────────────────
/**
 * GET /api/blockchain/block/:id
 * :id can be either a MongoDB ObjectId or a blockNumber
 */
const getBlock = async (req, res) => {
  try {
    const { id } = req.params;
    let block = null;

    // Try blockNumber first (numeric)
    if (/^\d+$/.test(id)) {
      block = await BlockchainBlock.findOne({ blockNumber: parseInt(id) }).populate('recordId', 'ownerName surveyNumber status');
    }

    // Fall back to MongoDB ObjectId
    if (!block) {
      try {
        block = await BlockchainBlock.findById(id).populate('recordId', 'ownerName surveyNumber status');
      } catch (castErr) {
        // id was not a valid ObjectId
      }
    }

    if (!block) {
      return res.status(404).json({
        success: false,
        message: 'Block not found.',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Block retrieved successfully.',
      data: { block },
    });
  } catch (error) {
    console.error('getBlock error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving block.',
      data: null,
    });
  }
};

// ─── Get Chain Stats ──────────────────────────────────────────────────────────
/**
 * GET /api/blockchain/stats
 */
const getStats = async (req, res) => {
  try {
    const chain = await BlockchainBlock.find().sort({ blockNumber: 1 });

    const totalBlocks = chain.length;
    const validation = validateChain(chain.map((b) => b.toObject()));

    const latestBlock = chain.length > 0 ? chain[chain.length - 1] : null;
    const genesisBlock = chain.length > 0 ? chain[0] : null;

    return res.status(200).json({
      success: true,
      message: 'Blockchain stats retrieved successfully.',
      data: {
        totalBlocks,
        isValid: validation.valid,
        validationMessage: validation.message,
        invalidAtBlock: validation.invalidAt,
        latestBlock: latestBlock
          ? { blockNumber: latestBlock.blockNumber, hash: latestBlock.hash, timestamp: latestBlock.timestamp }
          : null,
        genesisBlock: genesisBlock
          ? { blockNumber: genesisBlock.blockNumber, hash: genesisBlock.hash, timestamp: genesisBlock.timestamp }
          : null,
      },
    });
  } catch (error) {
    console.error('getStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving blockchain stats.',
      data: null,
    });
  }
};

module.exports = {
  getChain,
  verifyRecord,
  getBlock,
  getStats,
};
