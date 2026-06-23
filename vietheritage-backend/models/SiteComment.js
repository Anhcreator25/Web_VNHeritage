const mongoose = require('mongoose');

const siteCommentSchema = new mongoose.Schema({
  author:    { type: String, default: null },
  email:     { type: String, required: true },
  content:   { type: String, required: true },
  createdAt: { type: Date,   default: Date.now },
}, { collection: 'siteComments' });

module.exports = mongoose.model('SiteComment', siteCommentSchema);
