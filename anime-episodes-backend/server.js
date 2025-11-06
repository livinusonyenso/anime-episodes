require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const { apiLimiter } = require('./config/rateLimit');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: false,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Rate limit for all API routes
app.use('/api', apiLimiter);

// Health
app.get('/health', (req, res) => res.json({ ok:true, ts: Date.now() }));
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Server is running ✅",
    timestamp: Date.now(),
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/anime', require('./routes/animeRoutes'));
app.use('/api/episodes', require('./routes/episodeRoutes'));

// 404 + error
app.use(notFound);
app.use(errorHandler);

// Boot
const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`🚀 API on http://localhost:${PORT}`)))
  .catch((e) => { console.error('Mongo error:', e?.message); process.exit(1); });

module.exports = app;
