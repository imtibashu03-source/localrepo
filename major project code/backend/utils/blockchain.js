const crypto = require('crypto');

/**
 * Generate a SHA-256 hash of the given data object.
 * @param {Object|string} data
 * @returns {string} hex-encoded SHA-256 hash
 */
const generateHash = (data) => {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(dataString).digest('hex');
};

/**
 * Create the genesis block (block #0) of the chain.
 * @returns {Object} genesis block
 */
const createGenesisBlock = () => {
  const timestamp = new Date('2024-01-01T00:00:00.000Z');
  const genesisData = {
    message: 'Genesis Block — Land Revenue Records Blockchain',
    timestamp: timestamp.toISOString(),
  };
  const previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
  const nonce = 0;
  const hash = generateHash(
    JSON.stringify({ blockNumber: 0, previousHash, timestamp: timestamp.toISOString(), data: genesisData, nonce })
  );

  return {
    blockNumber: 0,
    hash,
    previousHash,
    timestamp,
    data: genesisData,
    nonce,
    recordId: null,
  };
};

/**
 * Create a new block following the given previousBlock.
 * @param {Object} previousBlock - the last block in the chain
 * @param {Object} recordData   - the land record data to embed
 * @param {string} [recordId]   - MongoDB ObjectId of the LandRecord
 * @returns {Object} new block
 */
const createBlock = (previousBlock, recordData, recordId = null) => {
  const blockNumber = previousBlock.blockNumber + 1;
  const previousHash = previousBlock.hash;
  const timestamp = new Date();
  let nonce = 0;
  let hash = '';

  // Simple proof-of-work: find hash starting with "00"
  do {
    nonce++;
    hash = generateHash(
      JSON.stringify({ blockNumber, previousHash, timestamp: timestamp.toISOString(), data: recordData, nonce })
    );
  } while (!hash.startsWith('00'));

  return {
    blockNumber,
    hash,
    previousHash,
    timestamp,
    data: recordData,
    nonce,
    recordId,
  };
};

/**
 * Validate the entire blockchain for hash integrity.
 * @param {Array<Object>} chain - ordered array of block objects
 * @returns {{ valid: boolean, invalidAt: number|null, message: string }}
 */
const validateChain = (chain) => {
  if (!chain || chain.length === 0) {
    return { valid: false, invalidAt: null, message: 'Chain is empty' };
  }

  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    // Verify the previous hash link
    if (currentBlock.previousHash !== previousBlock.hash) {
      return {
        valid: false,
        invalidAt: currentBlock.blockNumber,
        message: `Hash link broken at block #${currentBlock.blockNumber}: previousHash does not match block #${previousBlock.blockNumber} hash`,
      };
    }

    // Recompute and verify current block's hash
    const recomputedHash = generateHash(
      JSON.stringify({
        blockNumber: currentBlock.blockNumber,
        previousHash: currentBlock.previousHash,
        timestamp: new Date(currentBlock.timestamp).toISOString(),
        data: currentBlock.data,
        nonce: currentBlock.nonce,
      })
    );

    if (recomputedHash !== currentBlock.hash) {
      return {
        valid: false,
        invalidAt: currentBlock.blockNumber,
        message: `Hash mismatch at block #${currentBlock.blockNumber}: stored hash does not match recomputed hash`,
      };
    }
  }

  return { valid: true, invalidAt: null, message: 'Blockchain is valid' };
};

/**
 * Verify whether a record hash exists and is consistent in the given chain.
 * @param {string} hash  - block hash to look up
 * @param {Array<Object>} chain - ordered array of block objects
 * @returns {{ found: boolean, block: Object|null, chainValid: boolean, message: string }}
 */
const verifyRecord = (hash, chain) => {
  const block = chain.find((b) => b.hash === hash);

  if (!block) {
    return {
      found: false,
      block: null,
      chainValid: false,
      message: `No block found with hash: ${hash}`,
    };
  }

  const chainValidation = validateChain(chain);

  return {
    found: true,
    block,
    chainValid: chainValidation.valid,
    message: chainValidation.valid
      ? `Record verified. Block #${block.blockNumber} is part of a valid chain.`
      : `Record found at block #${block.blockNumber}, but chain integrity issue: ${chainValidation.message}`,
  };
};

module.exports = {
  generateHash,
  createGenesisBlock,
  createBlock,
  validateChain,
  verifyRecord,
};
