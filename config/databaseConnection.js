// config/databaseConnection.js
const mongoose = require('mongoose');

const DatabaseConnection = async () => {
  try {
    mongoose.set('strictQuery', false);
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
    });
    
    console.log('✅ Connected to MongoDB');

    
    // Handle connection errors after initial connection
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('💡 Check MONGODB_URI in .env and network access in MongoDB Atlas');
    process.exit(1);
  }
};

module.exports = DatabaseConnection;