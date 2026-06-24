const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  // Store favorites as strings with prefix to identify type, e.g., "article:abc123" or "heritage:hue"
  favorites: [{ type: String }],
}, { timestamps: true, collection: 'users' });

module.exports = mongoose.model('User', userSchema);
