require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');
const subscribeRoutes = require('./routes/subscribe');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB (interviewsathi-upcoming)'))
  .catch(err => console.error('MongoDB connection error:', err));

// CORS — allow BACKEND_URL from env or fallback to *
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

// Security
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', generalLimiter);

// Hide server info
app.disable('x-powered-by');

// Expose BACKEND_URL to frontend
app.get('/api/config', (req, res) => {
  res.json({ backendUrl: process.env.BACKEND_URL || '' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'interview-sathi-upcoming',
    port: process.env.PORT || 5001,
  });
});

// Routes
app.use('/api/subscribe', subscribeRoutes);

// Serve static frontend
app.use(express.static(path.join(__dirname, '../../frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// 404 handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Interview Sathi Upcoming — port ${PORT} | CORS: ${corsOrigin}`);
});

module.exports = app;
