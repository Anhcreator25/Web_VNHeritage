const mongoose = require('mongoose');

const articleCommentSchema = new mongoose.Schema({
  articleId: { type: String, required: true, index: true },
  author:    { type: String, default: null },
  email:     { type: String, required: true },
  content:   { type: String, required: true },
  createdAt: { type: Date,   default: Date.now },
}, { collection: 'articleComments' });

module.exports = mongoose.model('ArticleComment', articleCommentSchema);
