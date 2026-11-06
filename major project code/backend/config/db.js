const mongoose = require('mongoose');

let mongod = null; // holds the MongoMemoryServer instance if used

const connectDB = async () => {
  let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/landrecords';

  // ── Try primary URI first ──────────────────────────────────────────────────
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    attachListeners();
    return;
  } catch (primaryErr) {
    console.warn(`⚠️  Could not connect to MongoDB at ${uri}`);
    console.warn(`   Reason: ${primaryErr.message}`);
  }

  // ── Fallback: in-memory MongoDB (no installation needed) ──────────────────
  try {
    console.log('🔄  Attempting fallback: starting in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');

    mongod = await MongoMemoryServer.create({
      instance: { dbName: 'landrecords' },
    });

    const memUri = mongod.getUri();
    await mongoose.connect(memUri);

    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  ⚡ RUNNING WITH IN-MEMORY MONGODB                        ║');
    console.log('║  Data is stored in RAM — resets on server restart         ║');
    console.log('║  To persist data, install MongoDB Community Server:       ║');
    console.log('║  https://www.mongodb.com/try/download/community           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');

    attachListeners();
  } catch (memErr) {
    console.error('❌ Both MongoDB and in-memory fallback failed.');
    console.error('   Please install MongoDB: https://www.mongodb.com/try/download/community');
    console.error(`   Error: ${memErr.message}`);
    console.warn('⚠️  Server will continue to run, but database-dependent features will fail.');
  }
};

function attachListeners() {
  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB error: ${err.message}`);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected.');
  });
  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected.');
  });
}

// Stop the in-memory server on app exit
process.on('exit', async () => {
  if (mongod) await mongod.stop();
});

module.exports = connectDB;
