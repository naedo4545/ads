import { chromium, Browser, Page } from 'playwright';
import { createHash } from 'crypto';
import { Ad, Advertiser } from '@/types';
import { supabaseAdmin } from '@/lib/supabase';

interface FacebookCrawlConfig {
  baseUrl: string;
  maxPages: number;
  delay: number;
  userAgent: string;
}

class FacebookAdLibraryCrawler {
  private browser: Browser | null = null;
  private config: FacebookCrawlConfig;

  constructor() {
    this.config = {
      baseUrl: 'https://www.facebook.com/ads/library/',
      maxPages: parseInt(process.env.CRAWLER_MAX_PAGES || '10'),
      delay: parseInt(process.env.CRAWLER_DELAY || '2000'),
      userAgent: process.env.CRAWLER_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };
  }

  async start(): Promise<void> {
    try {
      console.log('🚀 Starting Facebook Ad Library crawler...');
      
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await this.browser.newPage();
      await page.setExtraHTTPHeaders({
        'User-Agent': this.config.userAgent
      });
      
      // Facebook Ad Library 접속
      await page.goto(this.config.baseUrl, { waitUntil: 'networkidle' });
      
      // 광고 데이터 수집
      const ads = await this.collectAds(page);
      console.log(`📊 Collected ${ads.length} ads from Facebook`);
      
      // 데이터베이스에 저장
      await this.saveToDatabase(ads);
      
      console.log('✅ Facebook crawling completed successfully!');
    } catch (error) {
      console.error('❌ Facebook crawling failed:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private async collectAds(page: Page): Promise<Ad[]> {
    const ads: Ad[] = [];
    let currentPage = 1;

    while (currentPage <= this.config.maxPages) {
      console.log(`📄 Processing Facebook page ${currentPage}...`);
      
      try {
        // 페이지 로드 대기
        await page.waitForLoadState('networkidle');
        
        // Facebook Ad Library의 광고 요소들 찾기
        const adSelectors = [
          '[data-testid="ad-card"]',
          '.ad-card',
          '.ad-item',
          '[role="article"]',
          '.x1yztbdb' // Facebook의 일반적인 광고 클래스
        ];
        
        let adElements = [];
        for (const selector of adSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
            adElements = await page.$$(selector);
            if (adElements.length > 0) {
              console.log(`✅ Found ${adElements.length} ads using selector: ${selector}`);
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (adElements.length === 0) {
          console.log('⚠️ No ad elements found, trying to extract from page content...');
          // 페이지 내용을 직접 분석
          const pageContent = await page.content();
          console.log('Page content preview:', pageContent.substring(0, 1000));
          break;
        }
        
        for (const adElement of adElements) {
          try {
            const ad = await this.extractAdData(adElement);
            if (ad) {
              ads.push(ad);
            }
          } catch (error) {
            console.warn('⚠️ Failed to extract ad data:', error);
          }
        }

        // 다음 페이지로 이동 시도
        const nextSelectors = [
          '[data-testid="next-page"]',
          '.next-page',
          'button[aria-label*="next"]',
          'a[aria-label*="next"]'
        ];
        
        let nextButton = null;
        for (const selector of nextSelectors) {
          nextButton = await page.$(selector);
          if (nextButton && await nextButton.isEnabled()) {
            break;
          }
        }
        
        if (!nextButton || !(await nextButton.isEnabled())) {
          console.log('🏁 Reached last page or no next button found');
          break;
        }

        await nextButton.click();
        await page.waitForTimeout(this.config.delay);
        currentPage++;
        
      } catch (error) {
        console.warn(`⚠️ Failed to process page ${currentPage}:`, error);
        break;
      }
    }

    return ads;
  }

  private async extractAdData(adElement: any): Promise<Ad | null> {
    try {
      // Facebook 광고 데이터 추출
      const titleSelectors = [
        '.ad-title',
        '.title',
        'h1', 'h2', 'h3',
        '.headline',
        '.ad-headline'
      ];
      
      let title = '';
      for (const selector of titleSelectors) {
        const titleElement = await adElement.$(selector);
        if (titleElement) {
          title = await titleElement.textContent() || '';
          if (title.trim()) break;
        }
      }
      
      if (!title) {
        const allText = await adElement.textContent();
        const lines = allText?.split('\n').filter(line => line.trim().length > 5) || [];
        title = lines[0] || 'Facebook Ad';
      }
      
      if (!title || title.trim().length < 3) return null;

      // 광고주 정보
      const advertiserName = 'Facebook Advertiser'; // Facebook에서는 광고주 정보가 제한적
      
      // 플랫폼 정보
      const platform = 'facebook';
      
      // 국가 정보
      const country = 'Unknown';
      
      // 미디어 URL 찾기
      let mediaUrl = '';
      let mediaType: 'video' | 'image' = 'image';
      
      const videoElement = await adElement.$('video');
      if (videoElement) {
        mediaUrl = await videoElement.getAttribute('src') || '';
        mediaType = 'video';
      } else {
        const imgElement = await adElement.$('img');
        if (imgElement) {
          mediaUrl = await imgElement.getAttribute('src') || '';
          mediaType = 'image';
        }
      }
      
      // 상세 링크
      const linkElement = await adElement.$('a');
      const detailUrl = linkElement ? await linkElement.getAttribute('href') || '' : '';
      
      // 콘텐츠 해시 생성
      const contentHash = this.generateContentHash(title, advertiserName, mediaUrl);
      
      // 광고주 ID 생성 또는 조회
      const advertiserId = await this.getOrCreateAdvertiser(advertiserName, country, platform);
      
      const ad: Ad = {
        id: '', // 데이터베이스에서 자동 생성
        advertiser_id: advertiserId,
        title: title.trim(),
        description: undefined,
        media_url: mediaUrl,
        media_type: mediaType,
        platform: platform as any,
        country: country,
        first_seen: new Date().toISOString(),
        status: 'active' as any,
        detail_url: detailUrl ? (detailUrl.startsWith('http') ? detailUrl : `https://facebook.com${detailUrl}`) : '',
        content_hash: contentHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return ad;
    } catch (error) {
      console.warn('⚠️ Failed to extract Facebook ad data:', error);
      return null;
    }
  }

  private async getOrCreateAdvertiser(name: string, country: string, platform: string): Promise<string> {
    try {
      // 기존 광고주 조회
      const { data: existingAdvertiser } = await supabaseAdmin
        .from('advertisers')
        .select('id')
        .eq('name', name)
        .eq('country', country)
        .eq('platform', platform)
        .single();

      if (existingAdvertiser) {
        return existingAdvertiser.id;
      }

      // 새 광고주 생성
      const { data: newAdvertiser, error } = await supabaseAdmin
        .from('advertisers')
        .insert({
          name,
          country,
          platform,
        })
        .select('id')
        .single();

      if (error || !newAdvertiser) {
        throw new Error(`Failed to create advertiser: ${error?.message}`);
      }

      return newAdvertiser.id;
    } catch (error) {
      console.error('❌ Failed to get or create advertiser:', error);
      throw error;
    }
  }

  private generateContentHash(title: string, advertiser: string, mediaUrl: string): string {
    const content = `${title}-${advertiser}-${mediaUrl}`;
    return createHash('sha256').update(content).digest('hex');
  }

  private async saveToDatabase(ads: Ad[]): Promise<void> {
    try {
      console.log('💾 Saving Facebook ads to database...');
      
      for (const ad of ads) {
        try {
          // 중복 체크
          const { data: existingAd } = await supabaseAdmin
            .from('ads')
            .select('id')
            .eq('content_hash', ad.content_hash)
            .single();

          if (existingAd) {
            console.log(`⏭️ Skipping duplicate ad: ${ad.title}`);
            continue;
          }

          // 새 광고 저장
          const { error } = await supabaseAdmin
            .from('ads')
            .insert(ad);

          if (error) {
            console.error(`❌ Failed to save ad "${ad.title}":`, error);
          } else {
            console.log(`✅ Saved Facebook ad: ${ad.title}`);
          }
        } catch (error) {
          console.error(`❌ Failed to process ad "${ad.title}":`, error);
        }
      }
      
      console.log(`💾 Facebook database operation completed. Processed ${ads.length} ads.`);
    } catch (error) {
      console.error('❌ Failed to save to database:', error);
      throw error;
    }
  }
}

// 메인 실행 함수
async function main() {
  const crawler = new FacebookAdLibraryCrawler();
  await crawler.start();
}

// 스크립트가 직접 실행될 때만 실행
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Facebook Crawler failed:', error);
    process.exit(1);
  });
}

export { FacebookAdLibraryCrawler };
