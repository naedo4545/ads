const { chromium } = require('playwright');

async function advancedDebug() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Advanced debugging Google Ads Transparency Center...');
    
    // 사이트 접속
    await page.goto('https://adstransparency.google.com/political', { waitUntil: 'networkidle' });
    
    // 더 오래 기다리기
    await page.waitForTimeout(10000);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log('Page title:', title);
    
    // 페이지 URL 확인
    console.log('Current URL:', page.url());
    
    // 모든 div 요소 찾기
    const divs = await page.$$eval('div', divs => 
      divs.map(div => ({
        className: div.className,
        id: div.id,
        textContent: div.textContent?.trim().substring(0, 100)
      })).filter(div => div.textContent && div.textContent.length > 10)
    );
    
    console.log('Found divs:', divs.slice(0, 20)); // 처음 20개만 출력
    
    // 모든 span 요소 찾기
    const spans = await page.$$eval('span', spans => 
      spans.map(span => ({
        className: span.className,
        id: span.id,
        textContent: span.textContent?.trim().substring(0, 100)
      })).filter(span => span.textContent && span.textContent.length > 5)
    );
    
    console.log('Found spans:', spans.slice(0, 20)); // 처음 20개만 출력
    
    // 모든 이미지 찾기
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        className: img.className
      }))
    );
    
    console.log('Found images:', images.slice(0, 10)); // 처음 10개만 출력
    
    // 모든 비디오 찾기
    const videos = await page.$$eval('video', videos => 
      videos.map(video => ({
        src: video.src,
        className: video.className
      }))
    );
    
    console.log('Found videos:', videos);
    
    // 페이지의 모든 텍스트 내용 확인
    const pageText = await page.textContent('body');
    console.log('Page text preview:', pageText.substring(0, 2000));
    
    // 잠시 대기해서 사용자가 브라우저를 확인할 수 있게 함
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Advanced debug failed:', error);
  } finally {
    await browser.close();
  }
}

advancedDebug();
