const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const proofRoutes = require('./routes/proofRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/proofs', proofRoutes);
app.use('/api/contacts', contactRoutes);

// Health Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: "Delivery Chacker API is healthy" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'An unexpected server error occurred' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
