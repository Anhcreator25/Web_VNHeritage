// cron.js – chạy crawler định kỳ (hàng tuần)
// Yêu cầu: npm i node-cron (đã được thêm vào package.json)

const cron = require('node-cron');
const { crawlAll } = require('./crawler');

console.log('🕒 Cron scheduler khởi động.');

// Lên lịch: mỗi Thứ Hai lúc 02:00 sáng (theo múi giờ máy chủ)
cron.schedule('0 2 * * 1', async () => {
  const now = new Date();
  console.log(`[${now.toLocaleString()}] ▶️ Bắt đầu cập nhật bài viết (định kỳ)`);
  try {
    await crawlAll();
    console.log(`[${new Date().toLocaleString()}] ✅ Cập nhật hoàn tất`);
  } catch (e) {
    console.error(`[${new Date().toLocaleString()}] ❌ Lỗi khi cập nhật:`, e);
  }
});

// Tùy chọn: chạy ngay khi khởi động để có dữ liệu ban đầu
// (bỏ comment nếu không muốn chạy tự động ngay)
// crawlAll().catch(err => console.error('❌ Lỗi chạy ngay:', err));
