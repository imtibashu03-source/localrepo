const LandRecord = require('../models/LandRecord');
const BlockchainBlock = require('../models/BlockchainBlock');
const Transaction = require('../models/Transaction');
const { generateHash, createGenesisBlock, createBlock } = require('../utils/blockchain');

// ─── Helper: ensure genesis block exists ─────────────────────────────────────
const ensureGenesisBlock = async () => {
  const count = await BlockchainBlock.countDocuments();
  if (count === 0) {
    const genesis = createGenesisBlock();
    await BlockchainBlock.create(genesis);
    console.log('Genesis block created.');
  }
};

// ─── Create Record ────────────────────────────────────────────────────────────
/**
 * POST /api/records
 */
const createRecord = async (req, res) => {
  try {
    await ensureGenesisBlock();

    const {
      ownerName,
      surveyNumber,
      location,
      district,
      state,
      area,
      areaUnit,
      registrationDate,
    } = req.body;

    // Check for duplicate survey number
    const existing = await LandRecord.findOne({ surveyNumber: surveyNumber?.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A land record with survey number '${surveyNumber}' already exists.`,
        data: null,
      });
    }

    // Create the land record (without blockchainHash first)
    const record = await LandRecord.create({
      ownerName: ownerName?.trim(),
      surveyNumber: surveyNumber?.trim(),
      location: location?.trim() || '',
      district: district?.trim() || '',
      state: state?.trim() || '',
      area: area || 0,
      areaUnit: areaUnit || 'acres',
      registrationDate: registrationDate ? new Date(registrationDate) : new Date(),
      createdBy: req.user._id,
      status: 'active',
    });

    // Get the latest block to build on top of
    const lastBlock = await BlockchainBlock.findOne().sort({ blockNumber: -1 });

    // Create new blockchain block
    const recordData = {
      recordId: record._id.toString(),
      ownerName: record.ownerName,
      surveyNumber: record.surveyNumber,
      location: record.location,
      district: record.district,
      state: record.state,
      area: record.area,
      areaUnit: record.areaUnit,
      registrationDate: record.registrationDate,
      createdBy: req.user._id.toString(),
      action: 'create',
    };

    const newBlock = createBlock(lastBlock, recordData, record._id);

    // Save the blockchain block
    const savedBlock = await BlockchainBlock.create(newBlock);

    // Update the land record with blockchain info
    record.blockchainHash = savedBlock.hash;
    record.blockNumber = savedBlock.blockNumber;
    await record.save();

    // Save transaction log
    await Transaction.create({
      type: 'create',
      recordId: record._id,
      userId: req.user._id,
      blockHash: savedBlock.hash,
      previousHash: savedBlock.previousHash,
      data: recordData,
    });

    const populatedRecord = await LandRecord.findById(record._id).populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Land record created and added to blockchain successfully.',
      data: { record: populatedRecord, blockchainHash: savedBlock.hash, blockNumber: savedBlock.blockNumber },
    });
  } catch (error) {
    console.error('createRecord error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A land record with this survey number already exists.',
        data: null,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error creating land record.',
      data: null,
    });
  }
};

// ─── Get Records (paginated + search) ────────────────────────────────────────
/**
 * GET /api/records?page=1&limit=10&search=...&district=...&status=...
 */
const getRecords = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    // Full-text search across ownerName, surveyNumber, location, district
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { ownerName: searchRegex },
        { surveyNumber: searchRegex },
        { location: searchRegex },
        { district: searchRegex },
      ];
    }

    if (req.query.district) filter.district = new RegExp(req.query.district.trim(), 'i');
    if (req.query.state) filter.state = new RegExp(req.query.state.trim(), 'i');
    if (req.query.status) filter.status = req.query.status;

    // Non-admin users can only see records they created
    if (req.user.role !== 'admin') {
      filter.createdBy = req.user._id;
    }

    const [records, total] = await Promise.all([
      LandRecord.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LandRecord.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Land records retrieved successfully.',
      data: {
        records,
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
    console.error('getRecords error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving land records.',
      data: null,
    });
  }
};

// ─── Get Single Record ────────────────────────────────────────────────────────
/**
 * GET /api/records/:id
 */
const getRecord = async (req, res) => {
  try {
    const record = await LandRecord.findById(req.params.id).populate('createdBy', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Land record not found.',
        data: null,
      });
    }

    // Non-admin: can only view their own records
    if (req.user.role !== 'admin' && record.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own records.',
        data: null,
      });
    }

    // Get related blockchain block
    const block = await BlockchainBlock.findOne({ hash: record.blockchainHash });

    return res.status(200).json({
      success: true,
      message: 'Land record retrieved successfully.',
      data: { record, block },
    });
  } catch (error) {
    console.error('getRecord error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid record ID.', data: null });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving land record.',
      data: null,
    });
  }
};

// ─── Update Record ────────────────────────────────────────────────────────────
/**
 * PUT /api/records/:id
 */
const updateRecord = async (req, res) => {
  try {
    const record = await LandRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Land record not found.',
        data: null,
      });
    }

    // Only admin or original creator can update
    if (req.user.role !== 'admin' && record.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own records.',
        data: null,
      });
    }

    const {
      ownerName,
      location,
      district,
      state,
      area,
      areaUnit,
      registrationDate,
      status,
      transferToOwner,
    } = req.body;

    // If ownership is being transferred, push to history
    if (transferToOwner && transferToOwner !== record.ownerName) {
      const transferHash = generateHash(
        JSON.stringify({
          from: record.ownerName,
          to: transferToOwner,
          surveyNumber: record.surveyNumber,
          transferDate: new Date().toISOString(),
        })
      );
      record.ownershipHistory.push({
        ownerName: record.ownerName,
        transferDate: new Date(),
        transferHash,
      });
      record.ownerName = transferToOwner;
      record.status = 'transferred';
    }

    // Apply updates
    if (ownerName && !transferToOwner) record.ownerName = ownerName.trim();
    if (location !== undefined) record.location = location.trim();
    if (district !== undefined) record.district = district.trim();
    if (state !== undefined) record.state = state.trim();
    if (area !== undefined) record.area = area;
    if (areaUnit !== undefined) record.areaUnit = areaUnit;
    if (registrationDate !== undefined) record.registrationDate = new Date(registrationDate);
    if (status !== undefined) record.status = status;

    // Get last block and create a new one for this update
    const lastBlock = await BlockchainBlock.findOne().sort({ blockNumber: -1 });

    const recordData = {
      recordId: record._id.toString(),
      ownerName: record.ownerName,
      surveyNumber: record.surveyNumber,
      location: record.location,
      district: record.district,
      state: record.state,
      area: record.area,
      areaUnit: record.areaUnit,
      status: record.status,
      updatedBy: req.user._id.toString(),
      action: transferToOwner ? 'transfer' : 'update',
    };

    const newBlock = createBlock(lastBlock, recordData, record._id);
    const savedBlock = await BlockchainBlock.create(newBlock);

    // Update blockchain reference on record
    record.blockchainHash = savedBlock.hash;
    record.blockNumber = savedBlock.blockNumber;

    await record.save();

    // Save transaction log
    await Transaction.create({
      type: transferToOwner ? 'transfer' : 'update',
      recordId: record._id,
      userId: req.user._id,
      blockHash: savedBlock.hash,
      previousHash: savedBlock.previousHash,
      data: recordData,
    });

    const populatedRecord = await LandRecord.findById(record._id).populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      message: `Land record ${transferToOwner ? 'transferred' : 'updated'} successfully.`,
      data: { record: populatedRecord, blockchainHash: savedBlock.hash, blockNumber: savedBlock.blockNumber },
    });
  } catch (error) {
    console.error('updateRecord error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid record ID.', data: null });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error updating land record.',
      data: null,
    });
  }
};

// ─── Delete Record ────────────────────────────────────────────────────────────
/**
 * DELETE /api/records/:id
 */
const deleteRecord = async (req, res) => {
  try {
    const record = await LandRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Land record not found.',
        data: null,
      });
    }

    // Only admin can delete records
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can delete land records.',
        data: null,
      });
    }

    // Log deletion transaction before removing
    await Transaction.create({
      type: 'delete',
      recordId: record._id,
      userId: req.user._id,
      blockHash: record.blockchainHash,
      previousHash: null,
      data: {
        surveyNumber: record.surveyNumber,
        ownerName: record.ownerName,
        deletedBy: req.user._id.toString(),
        action: 'delete',
      },
    });

    await LandRecord.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Land record deleted successfully.',
      data: { deletedId: req.params.id },
    });
  } catch (error) {
    console.error('deleteRecord error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid record ID.', data: null });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error deleting land record.',
      data: null,
    });
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
};
