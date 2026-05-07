const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGODB_URL;
    if (!uri) {
      throw new Error('Database connection string is missing. Please set MONGODB_URI or MONGO_URL in your environment variables.');
    }
    const conn = await mongoose.connect(uri);
    console.log(`[DB] Successfully connected to MongoDB at ${conn.connection.host}`);
  } catch (err) {
    console.error(`[DB] Connection failed - ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
