const { chromium } = require('playwright');

async function debugCrawler() {
  const browser = await chromium.launch({ headless: false }); // 브라우저를 보이게 실행
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Debugging Google Ads Transparency Center...');
    
    // 사이트 접속
    await page.goto('https://adstransparency.google.com/political', { waitUntil: 'networkidle' });
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log('Page title:', title);
    
    // 페이지 URL 확인
    console.log('Current URL:', page.url());
    
    // 페이지 내용 스크린샷
    await page.screenshot({ path: 'debug-screenshot.png' });
    console.log('Screenshot saved as debug-screenshot.png');
    
    // 모든 링크 찾기
    const links = await page.$$eval('a', links => 
      links.map(link => ({
        text: link.textContent?.trim(),
        href: link.href
      })).filter(link => link.text && link.text.length > 0)
    );
    
    console.log('Found links:', links.slice(0, 10)); // 처음 10개만 출력
    
    // 모든 버튼 찾기
    const buttons = await page.$$eval('button', buttons => 
      buttons.map(button => ({
        text: button.textContent?.trim(),
        className: button.className,
        id: button.id
      })).filter(button => button.text && button.text.length > 0)
    );
    
    console.log('Found buttons:', buttons.slice(0, 10)); // 처음 10개만 출력
    
    // 페이지의 모든 텍스트 내용 확인
    const pageText = await page.textContent('body');
    console.log('Page text preview:', pageText.substring(0, 1000));
    
    // 잠시 대기해서 사용자가 브라우저를 확인할 수 있게 함
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugCrawler();
