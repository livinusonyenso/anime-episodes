const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI missing');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('✅ Mongo connected:', mongoose.connection.host);
}

module.exports = { connectDB };
