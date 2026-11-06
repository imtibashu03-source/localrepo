const express = require('express');
const router = express.Router();
const {
  predictThreat,
  getThreatLogs,
  getAlerts,
  resolveAlert,
  getThreatStats,
} = require('../controllers/threatController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// POST /api/threats/predict               — run threat prediction
router.post('/predict', predictThreat);

// GET  /api/threats/logs                  — get threat logs (own or all for admin)
router.get('/logs', getThreatLogs);

// GET  /api/threats/alerts                — get alerts
router.get('/alerts', getAlerts);

// PUT  /api/threats/alerts/:id/resolve    — resolve an alert
router.put('/alerts/:id/resolve', resolveAlert);

// GET  /api/threats/stats                 — aggregated threat statistics
router.get('/stats', getThreatStats);

module.exports = router;
