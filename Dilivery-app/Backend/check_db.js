const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  
    const users = await User.find({});
    console.log('Users in DB:');
    users.forEach(u => {
      console.log(`- Email: "${u.email}", Password Hash: "${u.password}"`);
    });
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

checkDb();

