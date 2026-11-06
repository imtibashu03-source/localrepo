const express = require('express');
const router = express.Router();
const {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
} = require('../controllers/recordController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET  /api/records       — list records (paginated + search)
router.get('/', getRecords);

// POST /api/records       — create a new land record
router.post('/', createRecord);

// GET  /api/records/:id   — get single record
router.get('/:id', getRecord);

// PUT  /api/records/:id   — update record
router.put('/:id', updateRecord);

// DELETE /api/records/:id — delete record (admin only enforced in controller)
router.delete('/:id', deleteRecord);

module.exports = router;
