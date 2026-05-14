const fs = require("fs");
const express = require("express");
const cors = require("cors");
const app = express();
require('./cron');

// Optional admin secret (you may set process.env.ADMIN_SECRET)
const ADMIN_SECRET = process.env.ADMIN_SECRET || "super-secret-admin";

app.use(cors());
// Parse JSON bodies for POST requests
app.use(express.json());

// Hàm hỗ trợ đọc dữ liệu từ file JSON
const getLatestArticles = () => {
  try {
    // Đọc file trực tiếp mỗi khi gọi hàm để lấy dữ liệu mới nhất
    const rawData = fs.readFileSync("articles.json", "utf-8");
    return JSON.parse(rawData);
  } catch (err) {
    console.log("❌ Lỗi hoặc chưa có file articles.json, trả về mảng rỗng.");
    return [];
  }
};

// Helper for comments storage
const getComments = () => {
  try {
    const raw = fs.readFileSync("comments_detail.json", "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    // Nếu chưa có file, trả về mảng rỗng
    return [];
  }
};

const saveComments = (comments) => {
  fs.writeFileSync("comments.json", JSON.stringify(comments, null, 2));
};

// Email masking utility (used for non‑admin responses)
const maskEmail = (email) => {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const masked = local.slice(0, 2) + "***";
  return `${masked}@${domain}`;
};

// Middleware to detect admin via a custom header
const detectAdmin = (req, res, next) => {
  req.isAdmin = req.get("X-Admin-Secret") === ADMIN_SECRET;
  next();
};
app.use(detectAdmin);

// API lấy danh sách bài viết
app.get("/api/articles", (req, res) => {
  const data = getLatestArticles();
  console.log(
    `[${new Date().toLocaleTimeString()}] 🚀 Đã gửi ${data.length} bài viết cho khách.`,
  );
  res.json(data);
});

// (Tùy chọn) API tìm kiếm bài viết nếu bạn muốn làm thêm thanh Search
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

// Get comments for a specific article (email masked for non‑admin)
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

// Add a new comment (email is required)
app.post("/api/articles/:id/comments", (req, res) => {
  const articleId = req.params.id;
  const { author, email, content } = req.body;

  // Simple validation
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

  // Return comment – mask email for non‑admin callers
  const response = {
    id: newComment.id,
    author: newComment.author,
    email: req.isAdmin ? newComment.email : maskEmail(newComment.email),
    content: newComment.content,
    createdAt: newComment.createdAt,
  };
  res.json(response);
});

// ============================================================
// SITE COMMENTS (bình luận về trang web)
// ============================================================

const getSiteComments = () => {
  try {
    const raw = fs.readFileSync("site-comments.json", "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

const saveSiteComments = (comments) => {
  fs.writeFileSync("site-comments.json", JSON.stringify(comments, null, 2));
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`---`);
  console.log(`🚀 BACKEND CHẠY TẠI: http://localhost:${PORT}/api/articles`);
  console.log(`💡 Mẹo: Chạy 'node crawler.js' để cập nhật dữ liệu mới nhất!`);
  console.log(`---`);
});
