const axios = require('axios');
const ThreatLog = require('../models/ThreatLog');
const Alert = require('../models/Alert');
const User = require('../models/User');

// ─── Helper: Determine threat level from score ────────────────────────────────
const getThreatLevel = (score) => {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  if (score >= 25) return 'low';
  return 'safe';
};

// ─── Helper: Generate fallback recommendation ─────────────────────────────────
const getRecommendation = (threatLevel, features) => {
  if (threatLevel === 'high') {
    return 'IMMEDIATE ACTION REQUIRED: Suspicious activity detected. Block user session, notify administrator, and conduct security audit.';
  }
  if (threatLevel === 'medium') {
    return 'ELEVATED RISK: Monitor user activity closely. Consider requiring re-authentication and reviewing recent actions.';
  }
  if (threatLevel === 'low') {
    return 'LOW RISK: Minor anomalies detected. Continue monitoring and log activity for review.';
  }
  return 'No threat detected. Normal activity patterns observed.';
};

// ─── Predict Threat ───────────────────────────────────────────────────────────
/**
 * POST /api/threats/predict
 * Body: { features: { failedLogins, accessFrequency, ipMismatch, modificationAttempts, offHoursAccess, geoAnomalies, unusualPatterns, sessionDuration } }
 */
const predictThreat = async (req, res) => {
  try {
    const {
      failedLogins = 0,
      accessFrequency = 0,
      ipMismatch = 0,
      modificationAttempts = 0,
      offHoursAccess = 0,
      geoAnomalies = 0,
      unusualPatterns = 0,
      sessionDuration = 0,
    } = req.body.features || req.body || {};

    const features = {
      failedLogins,
      accessFrequency,
      ipMismatch,
      modificationAttempts,
      offHoursAccess,
      geoAnomalies,
      unusualPatterns,
      sessionDuration,
    };

    const clientIP =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.ip ||
      'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    let predictionResult = null;
    let mlServiceAvailable = false;

    // Try to call the ML service
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/predict`,
        { features },
        { timeout: 5000, headers: { 'Content-Type': 'application/json' } }
      );

      if (mlResponse.data) {
        predictionResult = mlResponse.data;
        mlServiceAvailable = true;
      }
    } catch (mlError) {
      console.warn('ML service unavailable, using fallback scoring:', mlError.message);
    }

    // Fallback scoring if ML service is unavailable
    if (!mlServiceAvailable) {
      const score = Math.min(
        100,
        failedLogins * 10 +
          accessFrequency * 2 +
          ipMismatch * 15 +
          modificationAttempts * 8 +
          offHoursAccess * 5 +
          geoAnomalies * 12 +
          unusualPatterns * 7 +
          Math.max(0, sessionDuration - 60) * 0.1
      );
      const threatLevel = getThreatLevel(score);
      predictionResult = {
        threatScore: Math.round(score),
        confidence: 70,
        threatLevel,
        recommendation: getRecommendation(threatLevel, features),
      };
    }

    const threatScore = predictionResult.threatScore ?? predictionResult.threat_score ?? 0;
    const confidence = predictionResult.confidence ?? 70;
    const threatLevel = predictionResult.threatLevel ?? predictionResult.threat_level ?? getThreatLevel(threatScore);
    const recommendation =
      predictionResult.recommendation ?? getRecommendation(threatLevel, features);

    // Save threat log
    const threatLog = await ThreatLog.create({
      userId: req.user._id,
      ipAddress: clientIP,
      userAgent,
      threatLevel,
      threatScore,
      confidence,
      features,
      recommendation,
    });

    // Create alert if threat score > 70
    let alert = null;
    if (threatScore > 70) {
      const alertType = threatScore >= 90 ? 'critical' : 'highRisk';
      alert = await Alert.create({
        type: alertType,
        title: `${alertType === 'critical' ? '🚨 Critical' : '⚠️ High Risk'} Threat Detected`,
        message: `User ${req.user.email} has a threat score of ${threatScore}. ${recommendation}`,
        userId: req.user._id,
        recordId: req.body.recordId || null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Threat prediction completed.',
      data: {
        threatScore,
        confidence,
        threatLevel,
        recommendation,
        logId: threatLog._id,
        alert: alert ? { id: alert._id, type: alert.type, title: alert.title } : null,
        mlServiceUsed: mlServiceAvailable,
      },
    });
  } catch (error) {
    console.error('predictThreat error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during threat prediction.',
      data: null,
    });
  }
};

// ─── Get Threat Logs ──────────────────────────────────────────────────────────
/**
 * GET /api/threats/logs?page=1&limit=10&threatLevel=high
 */
const getThreatLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    // Admin sees all logs; user sees only own
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    if (req.query.threatLevel) filter.threatLevel = req.query.threatLevel;
    if (req.query.userId && req.user.role === 'admin') filter.userId = req.query.userId;

    const [logs, total] = await Promise.all([
      ThreatLog.find(filter)
        .populate('userId', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      ThreatLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Threat logs retrieved successfully.',
      data: {
        logs,
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
    console.error('getThreatLogs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving threat logs.',
      data: null,
    });
  }
};

// ─── Get Alerts ───────────────────────────────────────────────────────────────
/**
 * GET /api/threats/alerts?resolved=false
 */
const getAlerts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    // Admin sees all; user sees own
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    if (req.query.resolved !== undefined) {
      filter.isResolved = req.query.resolved === 'true';
    }

    if (req.query.type) filter.type = req.query.type;

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .populate('userId', 'name email')
        .populate('recordId', 'ownerName surveyNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Alert.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Alerts retrieved successfully.',
      data: {
        alerts,
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
    console.error('getAlerts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving alerts.',
      data: null,
    });
  }
};

// ─── Resolve Alert ────────────────────────────────────────────────────────────
/**
 * PUT /api/threats/alerts/:id/resolve
 */
const resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found.',
        data: null,
      });
    }

    // Only admin or the alert owner can resolve
    if (req.user.role !== 'admin' && alert.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
        data: null,
      });
    }

    if (alert.isResolved) {
      return res.status(400).json({
        success: false,
        message: 'Alert is already resolved.',
        data: null,
      });
    }

    alert.isResolved = true;
    alert.resolvedAt = new Date();
    await alert.save();

    return res.status(200).json({
      success: true,
      message: 'Alert resolved successfully.',
      data: { alert },
    });
  } catch (error) {
    console.error('resolveAlert error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid alert ID.', data: null });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error resolving alert.',
      data: null,
    });
  }
};

// ─── Get Threat Stats ─────────────────────────────────────────────────────────
/**
 * GET /api/threats/stats
 */
const getThreatStats = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };

    // Threat level distribution
    const threatLevelDistribution = await ThreatLog.aggregate([
      { $match: filter },
      { $group: { _id: '$threatLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Average threat score
    const avgScoreResult = await ThreatLog.aggregate([
      { $match: filter },
      { $group: { _id: null, avgScore: { $avg: '$threatScore' }, maxScore: { $max: '$threatScore' }, totalLogs: { $sum: 1 } } },
    ]);

    const avgScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;
    const maxScore = avgScoreResult.length > 0 ? avgScoreResult[0].maxScore : 0;
    const totalLogs = avgScoreResult.length > 0 ? avgScoreResult[0].totalLogs : 0;

    // Trend: logs per day over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyTrend = await ThreatLog.aggregate([
      { $match: { ...filter, timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$threatScore' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Unresolved alerts count
    const unresolvedAlerts = await Alert.countDocuments({
      ...(req.user.role !== 'admin' ? { userId: req.user._id } : {}),
      isResolved: false,
    });

    return res.status(200).json({
      success: true,
      message: 'Threat statistics retrieved successfully.',
      data: {
        totalLogs,
        avgThreatScore: avgScore,
        maxThreatScore: maxScore,
        unresolvedAlerts,
        threatLevelDistribution: threatLevelDistribution.map((item) => ({
          level: item._id,
          count: item.count,
        })),
        dailyTrend: dailyTrend.map((item) => ({
          date: item._id,
          count: item.count,
          avgScore: Math.round(item.avgScore),
        })),
      },
    });
  } catch (error) {
    console.error('getThreatStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving threat statistics.',
      data: null,
    });
  }
};

module.exports = {
  predictThreat,
  getThreatLogs,
  getAlerts,
  resolveAlert,
  getThreatStats,
};
