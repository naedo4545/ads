const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const baseURL = process.env.SITE_TEST_URL || 'http://127.0.0.1:3100';
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless:true,args:['--no-sandbox']});
  const failures=[];
  const context = await browser.newContext({viewport:{width:1440,height:1080}});
  const page = await context.newPage();
  page.on('pageerror',error=>failures.push(error.message));
  const check = async (name, task) => {await task();console.log('PASS',name);};
  try {
    await check('Home renders eight example creatives',async()=>{
      const r=await page.goto(baseURL);assert.equal(r.status(),200);
      await page.getByRole('heading',{name:/다음 아이디어를/}).waitFor();
      assert.equal(await page.locator('.ad-card').count(),8);
      assert.equal(await page.locator('.demo-badge').innerText(),'예시 아카이브');
    });
    await page.screenshot({path:'/tmp/adlib-desktop.png',fullPage:true});
    await check('Keyword, category, platform and empty-state reset',async()=>{
      await page.getByRole('textbox',{name:'브랜드 또는 키워드 검색'}).fill('morrow');
      assert.equal(await page.locator('.ad-card').count(),1);
      await page.getByRole('button',{name:'검색어 지우기'}).click();
      await page.getByRole('button',{name:'테크 · 디지털',exact:true}).click();
      assert.equal(await page.locator('.ad-card').count(),2);
      await page.getByLabel('플랫폼 필터').selectOption('Meta');
      await page.getByRole('heading',{name:'일치하는 광고가 없어요.'}).waitFor();
      await page.getByRole('button',{name:'필터 초기화'}).click();
      assert.equal(await page.locator('.ad-card').count(),8);
      await page.getByLabel('광고 정렬').selectOption('brand');
      assert.equal(await page.locator('.brand-row strong').first().innerText(),'folio');
    });
    await check('Bookmark survives navigation and reload, then can be removed',async()=>{
      await page.getByRole('button',{name:'STRIDE 저장',exact:true}).click();
      await page.goto(baseURL+'/collection');
      await page.getByRole('button',{name:'STRIDE 저장 취소',exact:true}).waitFor();
      assert.equal(await page.locator('.ad-card').count(),1);
      await page.reload();
      await page.getByRole('button',{name:'STRIDE 저장 취소',exact:true}).click();
      await page.getByRole('heading',{name:'아직 모아둔 광고가 없어요.'}).waitFor();
      assert.equal(await page.locator('.ad-card').count(),0);
    });
    await check('Detail routes, query links and keyboard search',async()=>{
      await page.goto(baseURL+'/search?q=morrow');
      await page.waitForFunction(()=>document.querySelectorAll('.ad-card').length===1);
      await page.getByRole('link',{name:'피부가 쉬어가는 시간',exact:true}).click();
      await page.getByRole('heading',{name:'피부가 쉬어가는 시간',exact:true}).waitFor();
      await page.getByRole('button',{name:'컬렉션에 저장',exact:true}).click();
      await page.getByRole('button',{name:'컬렉션에 저장됨',exact:true}).waitFor();
      await page.goto(baseURL+'/detail/unknown');
      await page.getByRole('heading',{name:'광고를 찾을 수 없어요'}).waitFor();
      await page.goto(baseURL+'/search');
      await page.keyboard.press('Control+k');
      assert.equal(await page.locator('.search-field input').evaluate(el=>el===document.activeElement),true);
    });
    await check('Mobile navigation and layout at 390px',async()=>{
      await page.setViewportSize({width:390,height:844});
      await page.goto(baseURL);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
      await page.getByRole('button',{name:'메뉴 열기',exact:true}).click();
      await page.locator('.sidebar.is-open').waitFor();
      await page.getByRole('link',{name:'광고 탐색',exact:true}).click();
      await page.waitForURL('**/search');
      await page.getByRole('heading',{name:'좋은 광고, 더 가까이.'}).waitFor();
      assert.equal(await page.locator('.sidebar.is-open').count(),0);
      await page.screenshot({path:'/tmp/adlib-mobile.png',fullPage:true});
    });
    assert.deepEqual(failures,[],'No browser runtime errors');
    console.log('PASS No browser runtime errors');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
