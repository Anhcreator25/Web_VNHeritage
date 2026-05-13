const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

/** Helper: safely get trimmed text */
function getText($el) {
  return $el && $el.text() ? $el.text().trim() : '';
}

/** Helper: build article object with new fields */
function buildArticle({ id, title, img, excerpt, content, link, source, category, date, author = 'Khách', tags = [], location = '', heritageType = '' }) {
  return { id, title, img: img || '', excerpt: excerpt || '', content: content || '', link: link || '', source, category: category || '', date, author, tags, location, heritageType };
}

/** Main crawl function – gathers articles from all configured sources */
async function crawlAll() {
  let allArticles = [];
  console.log('🚀 Bắt đầu cào dữ liệu đa nguồn...');

// ---------- NGUỒN: Heritage Vietnam Airlines (Dị san & Phi vật thể) ----------
  // Whitelist of heritage titles (exact as shown in UI) – lower‑cased for comparison
  const whitelist = new Set([
    'Quần thể Cố đô Huế',
    'Vịnh Hạ Long',
    'Phố cổ Hội An',
    'Thánh địa Mỹ Sơn',
    'Hoàng thành thăng long',
    'Phong Nha - Kẻ Bàng',
    'Thành nhà Hồ',
    'Nhã nhạc Cung đình Huế',
    'Cồng chiêng Tây Nguyên',
    'Dân ca Quan họ Bắc Ninh',
    'Ca trù',
    'Hội Gióng đền Sóc & đền Phù Đổng',
    'Hát Xoan Phú Thọ',
    'Tín ngưỡng thờ cúng Hùng Vương',
    'Đờn ca tài tử Nam Bộ',
    'Dân ca Ví, Giặm Nghệ Tĩnh',
    'Nghi lễ và trò chơi Kéo co',
    'Thờ Mẫu Tam phủ người Việt',
    'Nghệ thuật Bài Chòi Trung Bộ',
    'Thực hành Then (Tày, Nùng, Thái)',
    'Nghệ thuật Xòe Thái',
    'Nghệ thuật làm Gốm người Chăm',
    'Lễ hội Vía Bà Chúa Xứ núi Sam',
    'Nghệ thuật Tranh dân gian Đông Hồ'
  ].map(t => t.trim().toLowerCase()));
  const sourceCategories = [
    { categoryUrl: 'https://heritagevietnamairlines.com/category/van-hoa-nghe-thuat/di-san/', heritageType: 'vật thể' },
    { categoryUrl: 'https://heritagevietnamairlines.com/category/van-hoa-nghe-thuat/phi-vat-the/', heritageType: 'phi vật thể' },
  ];
  for (const src of sourceCategories) {
    try {
      console.log(`🧐 Đang cào Heritage Vietnam Airlines category ${src.heritageType}...`);
      let page = 1;
      let globalIdx = 0;
      while (true) {
        const pageUrl = page === 1 ? src.categoryUrl : `${src.categoryUrl}?paged=${page}`;
        console.log(`Fetching page ${page} for ${src.heritageType} ...`);
        const resp = await axios.get(pageUrl);
        const $ = cheerio.load(resp.data);
        const blocks = $('.brxe-zfhpco');
        if (blocks.length === 0) {
          console.log('No more articles found, stopping pagination.');
          break;
        }
        for (let i = 0; i < blocks.length; i++) {
          const $block = $(blocks[i]);
          const link = $block.find('a.brxe-aeygvk.brxe-image.tag').attr('href');
          let img = $block.find('a.brxe-aeygvk.brxe-image.tag img').attr('src') || $block.find('a.brxe-aeygvk.brxe-image.tag img').attr('data-src');
const title = getText($block.find('h3.brxe-post-title a'));
console.log('Extracted title:', title);
          const date = getText($block.find('span.brxe-iphpdp'));
          let author = 'Khách';
          let content = '';
          let tags = [];
          let location = '';
          let excerpt = '';
          try {
            const detailResp = await axios.get(link);
            const $d = cheerio.load(detailResp.data);
            const metaAuthor = $d('meta[name="twitter:data1"]').attr('content');
            if (metaAuthor) author = metaAuthor.trim();
            const $post = $d('.brxe-post-content');
            if ($post.length) {
              $post.find('img').attr('style', 'max-width:100%;height:auto;');
              content = $post.html().trim();
              const firstPara = $post.find('p').first().text().trim();
              if (firstPara) excerpt = firstPara.slice(0, 150);
              if (!img) {
                const firstImg = $post.find('img').first().attr('src') || $post.find('img').first().attr('data-src');
                if (firstImg) img = firstImg;
              }
            }
            tags = $d('meta[property="article:tag"]').map((_, el) => $d(el).attr('content')).get();
            const metaLocation = $d('meta[property="article:section"]').attr('content');
            if (metaLocation) location = metaLocation.trim();
          } catch (inner) {
            // keep defaults on error
          }
          if (!img) {
            img = 'https://via.placeholder.com/300?text=No+Image';
          }
          allArticles.push(
            buildArticle({
              id: `hva-${globalIdx}`,
              title,
              img,
              excerpt,
              content,
              link,
              source: 'HeritageVietnamAirlines',
              category: 'Heritage',
              date,
              author,
              tags,
              location,
              heritageType: src.heritageType,
            })
          );
          globalIdx++;
        }
        page++;
      }
    } catch (e) {
      console.log(`⚠️ Lỗi Heritage Vietnam Airlines (${src.heritageType}): `, e.message);
    }
  }


  // ---------- Ghi file articles.json ----------
  try {
    // Loại bỏ trùng lặp dựa trên link (hoặc title)
    const uniq = new Map();
    allArticles.forEach(a => {
      const key = a.link || a.title;
      if (!uniq.has(key)) uniq.set(key, a);
    });
    // Remove entries with placeholder SVG images (generated for missing previews)
    const filtered = Array.from(uniq.values()).filter(a => !(a.img && a.img.startsWith('data:image')));
      const filteredWhite = filtered;
      fs.writeFileSync('articles.json', JSON.stringify(filteredWhite, null, 2), 'utf-8');
      console.log(`✅ Hoàn thành! Đã lưu ${filteredWhite.length} bài viết vào articles.json`);
  } catch (e) {
    console.log('⚠️ Lỗi ghi file articles.json:', e.message);
  }
}

// Khi gọi trực tiếp `node crawler.js` thực thi crawlAll
if (require.main === module) {
  crawlAll().catch(err => console.error('❌ Lỗi khi chạy crawler:', err));
}

module.exports = { crawlAll };