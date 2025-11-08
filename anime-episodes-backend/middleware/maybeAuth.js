const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function maybeAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return next();

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('watchedEpisodes').lean();
    if (user) req.user = user;
  } catch (e) {
    // Do nothing - user stays unauthenticated
  }
  next();
}

module.exports = { maybeAuth };
