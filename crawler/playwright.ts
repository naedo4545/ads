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
      baseUrl: 'https://transparencyreport.google.com/ads',
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
      await page.setUserAgent(this.config.userAgent);
      
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
        // 페이지의 광고 목록 대기
        await page.waitForSelector('[data-testid="ad-item"]', { timeout: 10000 });
        
        // 광고 아이템들 수집
        const adElements = await page.$$('[data-testid="ad-item"]');
        
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

        // 다음 페이지로 이동
        const nextButton = await page.$('[data-testid="next-page"]');
        if (!nextButton || !(await nextButton.isEnabled())) {
          console.log('🏁 Reached last page');
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
      // 광고 제목
      const titleElement = await adElement.$('[data-testid="ad-title"]');
      const title = titleElement ? await titleElement.textContent() : '';
      
      if (!title) return null;

      // 광고주 정보
      const advertiserElement = await adElement.$('[data-testid="advertiser-name"]');
      const advertiserName = advertiserElement ? await advertiserElement.textContent() : 'Unknown';
      
      // 플랫폼 정보
      const platformElement = await adElement.$('[data-testid="platform"]');
      const platform = platformElement ? await platformElement.textContent() : 'google';
      
      // 국가 정보
      const countryElement = await adElement.$('[data-testid="country"]');
      const country = countryElement ? await countryElement.textContent() : 'Unknown';
      
      // 미디어 타입 및 URL
      const mediaElement = await adElement.$('[data-testid="media-content"]');
      let mediaUrl = '';
      let mediaType: 'video' | 'image' = 'image';
      
      if (mediaElement) {
        const videoElement = await mediaElement.$('video');
        if (videoElement) {
          mediaUrl = await videoElement.getAttribute('src') || '';
          mediaType = 'video';
        } else {
          const imgElement = await mediaElement.$('img');
          if (imgElement) {
            mediaUrl = await imgElement.getAttribute('src') || '';
          }
        }
      }
      
      // 상세 링크
      const detailElement = await adElement.$('a[href*="/ads/"]');
      const detailUrl = detailElement ? await detailElement.getAttribute('href') : '';
      
      // 최초 게재일
      const dateElement = await adElement.$('[data-testid="first-seen"]');
      const firstSeenText = dateElement ? await dateElement.textContent() : '';
      const firstSeen = this.parseDate(firstSeenText);
      
      // 상태
      const statusElement = await adElement.$('[data-testid="status"]');
      const status = statusElement ? await statusElement.textContent() : 'active';
      
      // 설명
      const descriptionElement = await adElement.$('[data-testid="description"]');
      const description = descriptionElement ? await descriptionElement.textContent() : '';
      
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
        detail_url: detailUrl ? `https://transparencyreport.google.com${detailUrl}` : '',
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
