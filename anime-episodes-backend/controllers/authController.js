const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendMail } = require('../services/email');

function sign(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success:false, message:'Email already registered' });
    const user = await User.create({ email, password, name });
    const token = sign(user);
    res.status(201).json({ success:true, data:{ token, user: { id:user._id, email:user.email, name:user.name }}});
  } catch (e) { next(e); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // ✅ Must include password explicitly
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ success:false, message:'Invalid credentials' });
    }

    const token = sign(user);

    return res.json({
      success:true,
      data:{
        token,
        user: { id:user._id, email:user.email, name:user.name }
      }
    });

  } catch (e) { next(e); }
}


async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success:true, message:'If an account exists, an email has been sent' });
    const raw = crypto.randomBytes(32).toString('hex');
    const exp = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    user.resetToken = raw;
    user.resetTokenExp = exp;
    await user.save();
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${raw}&email=${encodeURIComponent(email)}`;
    await sendMail(email, 'Reset your password', `<p>Reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 1 hour.</p>`);
    res.json({ success:true, message:'If an account exists, an email has been sent' });
  } catch (e) { next(e); }
}

async function resetPassword(req, res, next) {
  try {
    const { token, email, newPassword } = req.body;
    const user = await User.findOne({ email, resetToken: token, resetTokenExp: { $gt: new Date() } });
    if (!user) return res.status(400).json({ success:false, message:'Invalid or expired token' });
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    await user.save();
    res.json({ success:true, message:'Password updated' });
  } catch (e) { next(e); }
}

module.exports = { register, login, requestPasswordReset, resetPassword };
