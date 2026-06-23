const fs = require("fs");
const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config();
require('./cron');

const ADMIN_SECRET = process.env.ADMIN_SECRET || "super-secret-admin";
const mongoose = require('mongoose');
const ArticleComment = require('./models/ArticleComment');
const SiteComment = require('./models/SiteComment');

app.use(cors());
app.use(express.json());

// ====== READ/WRITE DATA ======

const getLatestArticles = () => {
  try {
    const rawData = fs.readFileSync("articles.json", "utf-8");
    return JSON.parse(rawData);
  } catch (err) {
    console.log("Error or missing articles.json, returning empty array.");
    return [];
  }
};

// Comment storage moved to MongoDB

const maskEmail = (email) => {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const masked = local.slice(0, 2) + "***";
  return `${masked}@${domain}`;
};

// ====== MIDDLEWARE ======

const detectAdmin = (req, res, next) => {
  req.isAdmin = req.get("X-Admin-Secret") === ADMIN_SECRET;
  next();
};
app.use(detectAdmin);

// ====== ARTICLES API ======

app.get("/api/articles", (req, res) => {
  const data = getLatestArticles();
    console.log(`[${new Date().toLocaleTimeString()}] Sent ${data.length} articles to client.`);
  res.json(data);
});

app.get("/api/articles/search", (req, res) => {
  const query = req.query.q ? req.query.q.toLowerCase() : "";
  const data = getLatestArticles();
  const filtered = data.filter(
    (a) =>
      a.title.toLowerCase().includes(query) ||
      a.excerpt.toLowerCase().includes(query),
  );
  res.json(filtered);
});

// ====== ARTICLE COMMENTS API ======

app.get("/api/articles/:id/comments", async (req, res) => {
  try {
    const comments = await ArticleComment.find({ articleId: req.params.id })
                                        .sort({ createdAt: -1 });
    const result = comments.map(c => ({
      id: c._id.toString(),
      author: c.author,
      email: req.isAdmin ? c.email : maskEmail(c.email),
      content: c.content,
      createdAt: c.createdAt,
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không tải được bình luận bài viết" });
  }
});

app.post("/api/articles/:id/comments", async (req, res) => {
  const articleId = req.params.id;
  const { author, email, content } = req.body;
  console.log('POST comment body:', req.body);

   if (!email || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email.trim())) {
      return res.status(400).json({ error: "Email hợp lệ là bắt buộc" });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Nội dung bình luận không được để trống" });
    }

  try {
    const comment = await ArticleComment.create({
      articleId,
      author: author?.trim() || null,
      email: email.trim(),
      content: content.trim(),
      createdAt: new Date(),
    });

    res.json({
      id: comment._id.toString(),
      author: comment.author,
      email: req.isAdmin ? comment.email : maskEmail(comment.email),
      content: comment.content,
      createdAt: comment.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không lưu được bình luận bài viết" });
  }
});

// ====== SITE COMMENTS API ======

// Site comment storage moved to MongoDB

app.get("/api/site-comments", async (req, res) => {
  try {
    const comments = await SiteComment.find().sort({ createdAt: -1 });
    const result = comments.map(c => ({
      id: c._id.toString(),
      author: c.author,
      email: req.isAdmin ? c.email : maskEmail(c.email),
      content: c.content,
      createdAt: c.createdAt,
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không tải được bình luận site" });
  }
});

app.post("/api/site-comments", async (req, res) => {
  const { author, email, content } = req.body;
  console.log('POST comment body:', req.body);

  if (!email || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email.trim())) {
    return res.status(400).json({ error: "Email hợp lệ là bắt buộc" });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Nội dung bình luận không được để trống" });
  }

  try {
    const comment = await SiteComment.create({
      author: author?.trim() || null,
      email: email.trim(),
      content: content.trim(),
      createdAt: new Date(),
    });

    res.json({
      id: comment._id.toString(),
      author: comment.author,
      email: req.isAdmin ? comment.email : maskEmail(comment.email),
      content: comment.content,
      createdAt: comment.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không lưu được bình luận site" });
  }
});

// ====== SERVER STARTUP ======

const PORT = 5000;

mongoose
  .connect(process.env.MONGODB_URI)   // không truyền options
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log('---');
      console.log(`BACKEND RUNNING AT: http://localhost:${PORT}/api/articles`);
      console.log(`Run 'node crawler.js' to update the latest data!`);
      console.log('---');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
