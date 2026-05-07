const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[DB] Successfully connected to MongoDB at ${conn.connection.host}`);
  } catch (err) {
    console.error(`[DB] Connection failed - ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
