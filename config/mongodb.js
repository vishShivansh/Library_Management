const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDB = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    
    if (!mongoUrl) {
      console.log('⚠️  MongoDB URL not provided. Skipping MongoDB connection.');
      return null;
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(mongoUrl, options);
    console.log('✅ MongoDB connected successfully');
    console.log(`📍 MongoDB Database: ${mongoose.connection.db.databaseName}`);
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('⚠️  Continuing without MongoDB. Application will work with MySQL only.');
    return null;
  }
};

const disconnectMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    }
  } catch (error) {
    console.error('❌ Error disconnecting MongoDB:', error.message);
  }
};

module.exports = {
  connectMongoDB,
  disconnectMongoDB,
  mongoose,
};

