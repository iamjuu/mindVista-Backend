// config/databaseConnection.js
const mongoose = require('mongoose');

// Single connection promise so we never buffer: all callers share the same connection.
let connectionPromise = null;

const DatabaseConnection = async () => {
  if (connectionPromise) return connectionPromise;
  connectionPromise = (async () => {
    mongoose.set('strictQuery', false);
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined in .env');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false, // Do not buffer commands; fail fast if not connected
    });
    console.log('✅ Connected to MongoDB');
    mongoose.connection.on('error', err => console.error('❌ MongoDB error:', err));
    mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
  })().catch((err) => {
    connectionPromise = null; // Allow retry on next request
    console.error('❌ MongoDB connection error:', err.message);
    if (!process.env.VERCEL) process.exit(1);
    throw err;
  });
  return connectionPromise;
};

module.exports = DatabaseConnection;