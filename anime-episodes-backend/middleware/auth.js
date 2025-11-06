const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authRequired(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success:false, message:'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ success:false, message:'Unauthorized' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success:false, message:'Unauthorized' });
  }
}

module.exports = { authRequired };
