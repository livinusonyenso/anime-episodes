const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // ✅ Never return password by default
  },
  name: { type: String, default: '' },

  watchedEpisodes: [{ type: Schema.Types.ObjectId, ref: 'Episode' }],

  resetToken: { type: String },
  resetTokenExp: { type: Date }
}, { timestamps: true });

// ✅ Hash password before saving (only if modified)
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ✅ Compare passwords safely
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Ensure email has an index (performance)
UserSchema.index({ email: 1 });

module.exports = model('User', UserSchema);
