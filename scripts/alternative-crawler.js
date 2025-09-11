const { chromium } = require('playwright');

async function testAlternativeSources() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Testing alternative ad sources...');
    
    // 1. Facebook Ad Library (공개)
    console.log('\n1. Facebook Ad Library 테스트...');
    await page.goto('https://www.facebook.com/ads/library/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const fbTitle = await page.title();
    console.log('Facebook Ad Library title:', fbTitle);
    
    // 2. Google Ads Transparency Report (다른 경로)
    console.log('\n2. Google Transparency Report 테스트...');
    await page.goto('https://transparencyreport.google.com/political-ads/overview', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const googleTitle = await page.title();
    console.log('Google Transparency Report title:', googleTitle);
    
    // 3. Twitter Ad Transparency (공개)
    console.log('\n3. Twitter Ad Transparency 테스트...');
    await page.goto('https://transparency.twitter.com/en/reports/political-advertising.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const twitterTitle = await page.title();
    console.log('Twitter Ad Transparency title:', twitterTitle);
    
    // 4. YouTube Ad Library (공개)
    console.log('\n4. YouTube Ad Library 테스트...');
    await page.goto('https://www.youtube.com/ads/library/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const youtubeTitle = await page.title();
    console.log('YouTube Ad Library title:', youtubeTitle);
    
    console.log('\n✅ Alternative sources test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testAlternativeSources();
