require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const { apiLimiter } = require('./config/rateLimit');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.set('trust proxy', 1);

// middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://anime-episodes.onrender.com',
    ].filter(Boolean),
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const basePath =
  process.env.NODE_ENV === 'production' ? '/anime-episodes' : '';

app.use(`${basePath}/api`, apiLimiter);
app.get(`${basePath}/health`, (req, res) => res.json({ ok: true }));
app.use(`${basePath}/api/auth`, require('./routes/authRoutes'));
app.use(`${basePath}/api/anime`, require('./routes/animeRoutes'));
app.use(`${basePath}/api/episodes`, require('./routes/episodeRoutes'));
app.use(notFound);
app.use(errorHandler);

// ---------------- Boot section ----------------
const PORT = process.env.PORT || 5000;

// start server immediately
const server = app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});

// connect to Mongo separately (does NOT start a new server)
connectDB(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ Mongo connection error:', err.message));

module.exports = app;
