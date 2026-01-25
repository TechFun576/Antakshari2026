const mongoose = require('mongoose');
const Song = require('./models/Song');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/antakshari2025')
.then(() => {
  console.log('MongoDB Connected for Seeding');
  return seedDB();
})
.catch(err => {
  console.error('Seeding connection error:', err); 
  process.exit(1);
});

const seedDB = async () => {
    await Song.deleteMany({});

    const songs = []; 

    await Song.insertMany(songs);
    console.log('Database Seeded!');
    process.exit();
};
