const express = require('express');
const router = express.Router();
const { getChain, verifyRecord, getBlock, getStats } = require('../controllers/blockchainController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/blockchain/chain           — full blockchain
router.get('/chain', getChain);

// GET /api/blockchain/verify/:hash    — verify a record by its block hash
router.get('/verify/:hash', verifyRecord);

// GET /api/blockchain/block/:id       — single block by blockNumber or ObjectId
router.get('/block/:id', getBlock);

// GET /api/blockchain/stats           — chain statistics
router.get('/stats', getStats);

module.exports = router;
