require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Routes
const songRoutes = require('./routes/songRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/songs', songRoutes);
app.use('/api/auth', authRoutes);
// Legacy/Direct route for shuffle compatibility if needed, but better to update frontend to use /api/songs/shuffle
// Adding alias for frontend compatibility if strictly needed, or we update frontend.
// Let's update frontend to point to /api/songs/shuffle and /api/songs/selected


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
