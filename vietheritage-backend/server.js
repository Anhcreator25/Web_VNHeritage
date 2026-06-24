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
// New auth dependencies
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

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
    // Identify user email from token if provided (optional authentication)
    let currentUserEmail = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('email');
        if (user) currentUserEmail = user.email;
      } catch (e) {
        // ignore token errors
      }
    }
    const comments = await ArticleComment.find({ articleId: req.params.id })
                                          .sort({ createdAt: -1 });
    const result = comments.map(c => {
      const isOwner = currentUserEmail && c.email === currentUserEmail;
      return {
        id: c._id.toString(),
        author: c.author,
        email: req.isAdmin ? c.email : (isOwner ? '' : maskEmail(c.email)),
        content: c.content,
        createdAt: c.createdAt,
      };
    });
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

  // Determine email and author from JWT if token provided
  let finalEmail = email?.trim();
  let finalAuthor = author?.trim();

  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(payload.id).select('email displayName');
      if (user) {
        if (!finalEmail) finalEmail = user.email;
        if (!finalAuthor) finalAuthor = user.displayName || user.email.split('@')[0];
      }
    } catch (e) {
      // ignore token errors, fallback to provided values
    }
  }

  // Validate email and content
  if (!finalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(finalEmail)) {
    return res.status(400).json({ error: "Email hợp lệ là bắt buộc" });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Nội dung bình luận không được để trống" });
  }

  try {
    const comment = await ArticleComment.create({
      articleId,
      author: finalAuthor,
      email: finalEmail,
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
    // Identify user email if token present
    let currentUserEmail = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('email');
        if (user) currentUserEmail = user.email;
      } catch (e) {
        // ignore token errors
      }
    }
    const comments = await SiteComment.find().sort({ createdAt: -1 });
    const result = comments.map(c => {
      const isOwner = currentUserEmail && c.email === currentUserEmail;
      return {
        id: c._id.toString(),
        author: c.author,
        email: req.isAdmin ? c.email : (isOwner ? '' : maskEmail(c.email)),
        content: c.content,
        createdAt: c.createdAt,
      };
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không tải được bình luận site" });
  }
});

app.post("/api/site-comments", async (req, res) => {
  const { author, email, content } = req.body;
  console.log('POST comment body:', req.body);

  // Determine email and author from JWT if token provided
  let finalEmail = email?.trim();
  let finalAuthor = author?.trim();

  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(payload.id).select('email displayName');
      if (user) {
        if (!finalEmail) finalEmail = user.email;
        if (!finalAuthor) finalAuthor = user.displayName || user.email.split('@')[0];
      }
    } catch (e) {
      // ignore token errors
    }
  }

  // Validate email and content
  if (!finalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(finalEmail)) {
    return res.status(400).json({ error: "Email hợp lệ là bắt buộc" });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Nội dung bình luận không được để trống" });
  }

  try {
    const comment = await SiteComment.create({
      author: finalAuthor,
      email: finalEmail,
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

// ====== AUTH & USER ROUTES ======
// Register new user
// ====== ITINERARIES API ======
const Itinerary = require('./models/Itinerary');

// List user's itineraries
app.get('/api/itineraries', authenticate, async (req, res) => {
  try {
    const its = await Itinerary.find({ user: req.userId }).sort({ savedAt: -1 });
    res.json(its);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải lịch trình' });
  }
});

// Create itinerary
app.post('/api/itineraries', authenticate, async (req, res) => {
  const { title, description, itinerary, customPoints } = req.body;
  if (!title || !itinerary) return res.status(400).json({ error: 'Tiêu đề và hành trình là bắt buộc' });
  try {
    const newIt = await Itinerary.create({
      user: req.userId,
      title,
      description: description || '',
      itinerary,
      customPoints: customPoints || {}
    });
    res.json(newIt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lưu lịch trình thất bại' });
  }
});

// Get specific itinerary
app.get('/api/itineraries/:id', authenticate, async (req, res) => {
  try {
    const it = await Itinerary.findOne({ _id: req.params.id, user: req.userId });
    if (!it) return res.status(404).json({ error: 'Không tìm thấy lịch trình' });
    res.json(it);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải lịch trình' });
  }
});

// Update itinerary
app.put('/api/itineraries/:id', authenticate, async (req, res) => {
  const { title, description, itinerary, customPoints } = req.body;
  try {
    const it = await Itinerary.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, description, itinerary, customPoints },
      { new: true }
    );
    if (!it) return res.status(404).json({ error: 'Không tìm thấy lịch trình' });
    res.json(it);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cập nhật lịch trình thất bại' });
  }
});

// Delete itinerary
app.delete('/api/itineraries/:id', authenticate, async (req, res) => {
  try {
    const result = await Itinerary.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!result) return res.status(404).json({ error: 'Không tìm thấy lịch trình' });
    res.json({ message: 'Xóa lịch trình thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Xóa lịch trình thất bại' });
  }
});
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  // Yêu cầu bắt buộc email, password và tên (displayName)
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, mật khẩu và tên là bắt buộc' });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email đã được đăng ký' });
    const passwordHash = await bcrypt.hash(password, 10);
    // Lưu tên người dùng vào displayName
    const user = await User.create({ email, passwordHash, displayName: name.trim(), favorites: [] });
    // Thêm displayName vào payload JWT
    const token = jwt.sign({ id: user._id, role: user.role, displayName: user.displayName }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Đăng ký thất bại' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Sai thông tin' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Sai thông tin' });
    const token = jwt.sign({ id: user._id, role: user.role, displayName: user.displayName }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Đăng nhập thất bại' });
  }
});

// Middleware to verify JWT
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Thiếu token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }
}

// Middleware to require admin role
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Thiếu token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Không đủ quyền' });
    }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }
}

// Get current user profile (email + favorites)
app.get('/api/me', authenticate, async (req, res) => {
  try {
const user = await User.findById(req.userId).select('email displayName favorites');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ email: user.email, displayName: user.displayName, favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// Toggle favorite (add/remove)
app.post('/api/me/favorites', authenticate, async (req, res) => {
  const { itemId, type } = req.body; // type: 'article' or 'heritage'
  if (!itemId || !type) {
    return res.status(400).json({ error: 'itemId và type là bắt buộc' });
  }
  const key = `${type}:${itemId}`;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const idx = user.favorites.indexOf(key);
    if (idx === -1) {
      user.favorites.push(key);
    } else {
      user.favorites.splice(idx, 1);
    }
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi cập nhật yêu thích' });
  }
});

// ====== ADMIN ROUTES ======

// Get all comments (articles + sites)
app.get('/api/admin/comments', requireAdmin, async (req, res) => {
  try {
    const articleComments = await ArticleComment.find().sort({ createdAt: -1 });
    const siteComments = await SiteComment.find().sort({ createdAt: -1 });
    const formatted = [
      ...articleComments.map(c => ({
        id: c._id,
        type: 'article',
        author: c.author,
        email: c.email,
        content: c.content,
        createdAt: c.createdAt
      })),
      ...siteComments.map(c => ({
        id: c._id,
        type: 'site',
        author: c.author,
        email: c.email,
        content: c.content,
        createdAt: c.createdAt
      }))
    ];
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải bình luận' });
  }
});

// Update comment (article or site)
app.put('/api/admin/comments/:type/:id', requireAdmin, async (req, res) => {
  const { type, id } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Nội dung trống' });
  let Model;
  if (type === 'article') Model = ArticleComment;
  else if (type === 'site') Model = SiteComment;
  else return res.status(400).json({ error: 'Loại không hợp lệ' });
  try {
    const updated = await Model.findByIdAndUpdate(id, { content }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi cập nhật' });
  }
});

// Delete comment
app.delete('/api/admin/comments/:type/:id', requireAdmin, async (req, res) => {
  const { type, id } = req.params;
  let Model;
  if (type === 'article') Model = ArticleComment;
  else if (type === 'site') Model = SiteComment;
  else return res.status(400).json({ error: 'Loại không hợp lệ' });
  try {
    const del = await Model.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi xóa' });
  }
});

// Get all users (admin view)
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('email role createdAt');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải người dùng' });
  }
});

// Update user role
app.patch('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: 'Vai trò trống' });
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi cập nhật' });
  }
});

// Delete user
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const del = await User.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi xóa' });
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
