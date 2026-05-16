const fs = require("fs");
const express = require("express");
const cors = require("cors");
const app = express();
require('./cron');

const ADMIN_SECRET = process.env.ADMIN_SECRET || "super-secret-admin";

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

const getComments = () => {
  try {
    const raw = fs.readFileSync("comment_detail.json", "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

const saveComments = (comments) => {
  fs.writeFileSync("comment_detail.json", JSON.stringify(comments, null, 2));
};

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

app.get("/api/articles/:id/comments", (req, res) => {
  const articleId = req.params.id;
  const allComments = getComments().filter((c) => c.articleId === articleId);
  const result = allComments.map((c) => ({
    id: c.id,
    author: c.author,
    email: req.isAdmin ? c.email : maskEmail(c.email),
    content: c.content,
    createdAt: c.createdAt,
  }));
  res.json(result);
});

app.post("/api/articles/:id/comments", (req, res) => {
  const articleId = req.params.id;
  const { author, email, content } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Email hợp lệ là bắt buộc" });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Nội dung bình luận không được để trống" });
  }

  const comments = getComments();
  const newComment = {
    id: `cmt-${Date.now()}`,
    articleId,
    author: author?.trim() || null,
    email: email.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
  comments.push(newComment);
  saveComments(comments);

  const response = {
    id: newComment.id,
    author: newComment.author,
    email: req.isAdmin ? newComment.email : maskEmail(newComment.email),
    content: newComment.content,
    createdAt: newComment.createdAt,
  };
  res.json(response);
});

// ====== SITE COMMENTS API ======

const getSiteComments = () => {
  try {
    const raw = fs.readFileSync("site_comment.json", "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

const saveSiteComments = (comments) => {
  fs.writeFileSync("site_comment.json", JSON.stringify(comments, null, 2));
};

app.get("/api/site-comments", (req, res) => {
  const comments = getSiteComments();
  const result = comments.map(c => ({
    id: c.id,
    author: c.author,
    email: req.isAdmin ? c.email : maskEmail(c.email),
    content: c.content,
    createdAt: c.createdAt,
  }));
  res.json(result);
});

app.post("/api/site-comments", (req, res) => {
  const { author, email, content } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Email hợp lệ là bắt buộc" });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Nội dung bình luận không được để trống" });
  }

  const comments = getSiteComments();
  const newComment = {
    id: `site-cmt-${Date.now()}`,
    author: author?.trim() || null,
    email: email.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
  comments.push(newComment);
  saveSiteComments(comments);

  const response = {
    id: newComment.id,
    author: newComment.author,
    email: req.isAdmin ? newComment.email : maskEmail(newComment.email),
    content: newComment.content,
    createdAt: newComment.createdAt,
  };
  res.json(response);
});

// ====== SERVER STARTUP ======

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`---`);
  console.log(`BACKEND RUNNING AT: http://localhost:${PORT}/api/articles`);
  console.log(`Run 'node crawler.js' to update the latest data!`);
  console.log(`---`);
});
