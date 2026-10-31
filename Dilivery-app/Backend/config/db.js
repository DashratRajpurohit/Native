const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongodb_connection_string') {
      console.log('⚠️ MongoDB connection skipped: Please update MONGO_URI in .env');
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('Please ensure MongoDB is running locally or MONGO_URI is set correctly in .env');
  }
};

module.exports = connectDB;
