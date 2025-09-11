const { AdsTransparencyCrawler } = require('../crawler/playwright.ts');

async function testCrawler() {
  try {
    console.log('🧪 Testing crawler...');
    
    const crawler = new AdsTransparencyCrawler();
    
    // 테스트용으로 최대 페이지 수를 1로 제한
    process.env.CRAWLER_MAX_PAGES = '1';
    
    await crawler.start();
    
    console.log('✅ Crawler test completed!');
  } catch (error) {
    console.error('❌ Crawler test failed:', error);
  }
}

testCrawler();
