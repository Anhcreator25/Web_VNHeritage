const axios = require('axios');
const cheerio = require('cheerio');
(async () => {
  const resp = await axios.get('https://heritagevietnamairlines.com/');
  const $ = cheerio.load(resp.data);
  const blocks = $('.brxe-vyavau.brxe-block');
  console.log('Blocks count:', blocks.length);
  blocks.each((i, el) => {
    if (i < 5) {
      const $block = $(el);
      const title = $block.find('h3.brxe-post-title a').text().trim();
      const date = $block.find('.brxe-cbfddm span').text().trim();
      console.log(i, 'title:', title, 'date:', date);
    }
  });
})();