import { chromium, Browser, Page } from 'playwright';
import { createHash } from 'crypto';
import { Ad, Advertiser } from '@/types';
import { supabaseAdmin } from '@/lib/supabase';

interface CrawlConfig {
  baseUrl: string;
  maxPages: number;
  delay: number;
  userAgent: string;
}

class AdsTransparencyCrawler {
  private browser: Browser | null = null;
  private config: CrawlConfig;

  constructor() {
    this.config = {
      baseUrl: 'https://adstransparency.google.com/political',
      maxPages: parseInt(process.env.CRAWLER_MAX_PAGES || '100'),
      delay: parseInt(process.env.CRAWLER_DELAY || '1000'),
      userAgent: process.env.CRAWLER_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };
  }

  async start(): Promise<void> {
    try {
      console.log('🚀 Starting Google Ads Transparency Center crawler...');
      
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await this.browser.newPage();
      await page.setExtraHTTPHeaders({
        'User-Agent': this.config.userAgent
      });
      
      // 기본 페이지 로드
      await page.goto(this.config.baseUrl, { waitUntil: 'networkidle' });
      
      // 광고 데이터 수집
      const ads = await this.collectAds(page);
      console.log(`📊 Collected ${ads.length} ads`);
      
      // 데이터베이스에 저장
      await this.saveToDatabase(ads);
      
      console.log('✅ Crawling completed successfully!');
    } catch (error) {
      console.error('❌ Crawling failed:', error);
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
      console.log(`📄 Processing page ${currentPage}...`);
      
      try {
        // 페이지 로드 대기
        await page.waitForLoadState('networkidle');
        
        // 실제 Google Ads Transparency Center의 셀렉터들 시도
        let adElements = [];
        
        // 다양한 가능한 셀렉터들 시도
        const possibleSelectors = [
          '[data-testid="ad-item"]',
          '.ad-item',
          '.advertisement-item',
          '.ad-card',
          '.ad-container',
          '[role="article"]',
          '.result-item',
          '.search-result'
        ];
        
        for (const selector of possibleSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
            adElements = await page.$$(selector);
            if (adElements.length > 0) {
              console.log(`✅ Found ${adElements.length} ads using selector: ${selector}`);
              break;
            }
          } catch (e) {
            // 셀렉터가 없으면 다음 시도
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
          '.pagination-next',
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
      // 다양한 셀렉터로 광고 제목 찾기
      const titleSelectors = [
        '[data-testid="ad-title"]',
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
        // 전체 텍스트에서 첫 번째 의미있는 텍스트 찾기
        const allText = await adElement.textContent();
        const lines = allText?.split('\n').filter(line => line.trim().length > 5) || [];
        title = lines[0] || 'Unknown Ad';
      }
      
      if (!title || title.trim().length < 3) return null;

      // 광고주 정보 찾기
      const advertiserSelectors = [
        '[data-testid="advertiser-name"]',
        '.advertiser',
        '.advertiser-name',
        '.brand',
        '.company'
      ];
      
      let advertiserName = 'Unknown';
      for (const selector of advertiserSelectors) {
        const advertiserElement = await adElement.$(selector);
        if (advertiserElement) {
          advertiserName = await advertiserElement.textContent() || 'Unknown';
          if (advertiserName.trim() && advertiserName !== 'Unknown') break;
        }
      }
      
      // 플랫폼 정보
      const platformSelectors = [
        '[data-testid="platform"]',
        '.platform',
        '.source'
      ];
      
      let platform = 'google';
      for (const selector of platformSelectors) {
        const platformElement = await adElement.$(selector);
        if (platformElement) {
          platform = await platformElement.textContent() || 'google';
          break;
        }
      }
      
      // 국가 정보
      const countrySelectors = [
        '[data-testid="country"]',
        '.country',
        '.region'
      ];
      
      let country = 'Unknown';
      for (const selector of countrySelectors) {
        const countryElement = await adElement.$(selector);
        if (countryElement) {
          country = await countryElement.textContent() || 'Unknown';
          break;
        }
      }
      
      // 미디어 타입 및 URL 찾기
      const mediaSelectors = [
        '[data-testid="media-content"]',
        '.media',
        '.ad-media',
        '.content'
      ];
      
      let mediaUrl = '';
      let mediaType: 'video' | 'image' = 'image';
      
      for (const selector of mediaSelectors) {
        const mediaElement = await adElement.$(selector);
        if (mediaElement) {
          const videoElement = await mediaElement.$('video');
          if (videoElement) {
            mediaUrl = await videoElement.getAttribute('src') || '';
            mediaType = 'video';
            break;
          } else {
            const imgElement = await mediaElement.$('img');
            if (imgElement) {
              mediaUrl = await imgElement.getAttribute('src') || '';
              mediaType = 'image';
              break;
            }
          }
        }
      }
      
      // 전체 요소에서 이미지나 비디오 찾기
      if (!mediaUrl) {
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
      }
      
      // 상세 링크 찾기
      const linkSelectors = [
        'a[href*="/ads/"]',
        'a[href*="transparency"]',
        'a[href*="ad"]',
        'a'
      ];
      
      let detailUrl = '';
      for (const selector of linkSelectors) {
        const detailElement = await adElement.$(selector);
        if (detailElement) {
          detailUrl = await detailElement.getAttribute('href') || '';
          if (detailUrl) break;
        }
      }
      
      // 최초 게재일 찾기
      const dateSelectors = [
        '[data-testid="first-seen"]',
        '.date',
        '.first-seen',
        '.published',
        '.created'
      ];
      
      let firstSeenText = '';
      for (const selector of dateSelectors) {
        const dateElement = await adElement.$(selector);
        if (dateElement) {
          firstSeenText = await dateElement.textContent() || '';
          if (firstSeenText.trim()) break;
        }
      }
      
      const firstSeen = this.parseDate(firstSeenText);
      
      // 상태 찾기
      const statusSelectors = [
        '[data-testid="status"]',
        '.status',
        '.state'
      ];
      
      let status = 'active';
      for (const selector of statusSelectors) {
        const statusElement = await adElement.$(selector);
        if (statusElement) {
          status = await statusElement.textContent() || 'active';
          break;
        }
      }
      
      // 설명 찾기
      const descriptionSelectors = [
        '[data-testid="description"]',
        '.description',
        '.content',
        '.text',
        'p'
      ];
      
      let description = '';
      for (const selector of descriptionSelectors) {
        const descriptionElement = await adElement.$(selector);
        if (descriptionElement) {
          description = await descriptionElement.textContent() || '';
          if (description.trim() && description !== title) break;
        }
      }
      
      // 콘텐츠 해시 생성 (중복 방지)
      const contentHash = this.generateContentHash(title, advertiserName, mediaUrl);
      
      // 광고주 ID 생성 또는 조회
      const advertiserId = await this.getOrCreateAdvertiser(advertiserName, country, platform);
      
      const ad: Ad = {
        id: '', // 데이터베이스에서 자동 생성
        advertiser_id: advertiserId,
        title: title.trim(),
        description: description?.trim() || undefined,
        media_url: mediaUrl,
        media_type: mediaType,
        platform: platform as any,
        country: country,
        first_seen: firstSeen.toISOString(),
        status: status as any,
        detail_url: detailUrl ? (detailUrl.startsWith('http') ? detailUrl : `https://transparencyreport.google.com${detailUrl}`) : '',
        content_hash: contentHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return ad;
    } catch (error) {
      console.warn('⚠️ Failed to extract ad data:', error);
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

  private parseDate(dateText: string): Date {
    try {
      // 다양한 날짜 형식 파싱
      const date = new Date(dateText);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      // 상대적 날짜 파싱 (예: "2 days ago", "1 week ago")
      const relativeDateMatch = dateText.match(/(\d+)\s+(day|week|month|year)s?\s+ago/);
      if (relativeDateMatch) {
        const amount = parseInt(relativeDateMatch[1]);
        const unit = relativeDateMatch[2];
        const now = new Date();
        
        switch (unit) {
          case 'day':
            now.setDate(now.getDate() - amount);
            break;
          case 'week':
            now.setDate(now.getDate() - (amount * 7));
            break;
          case 'month':
            now.setMonth(now.getMonth() - amount);
            break;
          case 'year':
            now.setFullYear(now.getFullYear() - amount);
            break;
        }
        return now;
      }
      
      // 기본값: 현재 날짜
      return new Date();
    } catch (error) {
      console.warn('⚠️ Failed to parse date, using current date:', dateText);
      return new Date();
    }
  }

  private async saveToDatabase(ads: Ad[]): Promise<void> {
    try {
      console.log('💾 Saving ads to database...');
      
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
            console.log(`✅ Saved ad: ${ad.title}`);
          }
        } catch (error) {
          console.error(`❌ Failed to process ad "${ad.title}":`, error);
        }
      }
      
      console.log(`💾 Database operation completed. Processed ${ads.length} ads.`);
    } catch (error) {
      console.error('❌ Failed to save to database:', error);
      throw error;
    }
  }
}

// 메인 실행 함수
async function main() {
  const crawler = new AdsTransparencyCrawler();
  await crawler.start();
}

// 스크립트가 직접 실행될 때만 실행
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Crawler failed:', error);
    process.exit(1);
  });
}

export { AdsTransparencyCrawler };
