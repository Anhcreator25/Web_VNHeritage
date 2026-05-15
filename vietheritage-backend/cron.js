// ====== CRON: Weekly scheduled crawl ======

const cron = require('node-cron');
const { crawlAll } = require('./crawler');

console.log('Cron scheduler started.');

cron.schedule('0 2 * * 1', async () => {
  const now = new Date();
  console.log(`[${now.toLocaleString()}] Starting scheduled article update`);
  try {
    await crawlAll();
    console.log(`[${new Date().toLocaleString()}] Update completed`);
  } catch (e) {
    console.error(`[${new Date().toLocaleString()}] Update error:`, e);
  }
});
