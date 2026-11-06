require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const threatRoutes = require('./routes/threatRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Request Logging ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting (global) ───────────────────────────────────────────────────
app.use(generalLimiter);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Intelligent Cyber Threat Prediction Model — Backend API is running.',
    data: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy.',
    data: { uptime: process.uptime(), timestamp: new Date().toISOString() },
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
    data: null,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error.';

  res.status(statusCode).json({
    success: false,
    message,
    data: process.env.NODE_ENV === 'development' ? { stack: err.stack } : null,
  });
});

// ─── Admin Seed ───────────────────────────────────────────────────────────────
const seedAdminUser = async () => {
  try {
    const User = require('./models/User');
    const adminEmail = 'admin@landrecords.gov.in';
    const existing = await User.findOne({ email: adminEmail });

    if (!existing) {
      await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: 'Admin@123',
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Admin user seeded: admin@landrecords.gov.in / Admin@123');
    } else {
      console.log('ℹ️  Admin user already exists.');
    }
  } catch (error) {
    console.error('Admin seed error:', error.message);
  }
};

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    await seedAdminUser();

    app.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════════╗');
      console.log('║   Intelligent Cyber Threat Prediction — Backend API          ║');
      console.log('╠══════════════════════════════════════════════════════════════╣');
      console.log(`║   Server running on   : http://localhost:${PORT}               ║`);
      console.log(`║   Environment         : ${(process.env.NODE_ENV || 'development').padEnd(35)}║`);
      console.log(`║   MongoDB URI         : ${(process.env.MONGO_URI || '').substring(0, 35).padEnd(35)}║`);
      console.log('╠══════════════════════════════════════════════════════════════╣');
      console.log('║   Routes:                                                    ║');
      console.log('║     POST /api/auth/register                                  ║');
      console.log('║     POST /api/auth/login                                     ║');
      console.log('║     GET  /api/auth/me                                        ║');
      console.log('║     GET  /api/records                                        ║');
      console.log('║     POST /api/records                                        ║');
      console.log('║     GET  /api/blockchain/chain                               ║');
      console.log('║     GET  /api/blockchain/verify/:hash                        ║');
      console.log('║     POST /api/threats/predict                                ║');
      console.log('║     GET  /api/threats/logs                                   ║');
      console.log('║     GET  /api/admin/stats                                    ║');
      console.log('╚══════════════════════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();

module.exports = app;
