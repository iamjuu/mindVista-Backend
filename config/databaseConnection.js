// config/databaseConnection.js
const mongoose = require('mongoose');

const DatabaseConnection = async () => {
  try {
    mongoose.set('strictQuery', false);
    
    await mongoose.connect('mongodb://127.0.0.1:27017/mindVista', {
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
    console.error('💡 Make sure MongoDB is running on port 27017');
    process.exit(1);
  }
};

module.exports = DatabaseConnection;