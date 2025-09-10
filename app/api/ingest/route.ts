import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { AdsTransparencyCrawler } from '@/crawler/playwright';
import { ApiResponse, CrawlResult } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<CrawlResult>>> {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { force = false, maxPages = 10 } = body;

    // 환경 변수 검증
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, error: 'Missing environment variables' },
        { status: 500 }
      );
    }

    console.log('🚀 Starting manual ingestion...');

    // 크롤러 실행
    const crawler = new AdsTransparencyCrawler();
    const startTime = Date.now();

    try {
      // 크롤러 설정 업데이트
      process.env.CRAWLER_MAX_PAGES = maxPages.toString();
      
      await crawler.start();
      
      const duration = Date.now() - startTime;
      
      // 결과 조회
      const { count } = await supabaseAdmin
        .from('ads')
        .select('*', { count: 'exact', head: true });

      const result: CrawlResult = {
        success: true,
        ads_count: count || 0,
        duration_ms: duration,
      };

      console.log(`✅ Ingestion completed: ${result.ads_count} ads processed in ${duration}ms`);

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Ingestion completed successfully',
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Ingestion failed:', error);

      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          data: {
            success: false,
            ads_count: 0,
            duration_ms: duration,
            errors: [error instanceof Error ? error.message : 'Unknown error'],
          } as CrawlResult,
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Invalid request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request body',
      },
      { status: 400 }
    );
  }
}

export async function GET(): Promise<NextResponse<ApiResponse<any>>> {
  try {
    // 현재 데이터베이스 상태 조회
    const [adsCount, advertisersCount, enrichmentsCount] = await Promise.all([
      supabaseAdmin.from('ads').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('advertisers').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('ad_enrichments').select('*', { count: 'exact', head: true }),
    ]);

    const stats = {
      ads: adsCount.count || 0,
      advertisers: advertisersCount.count || 0,
      enrichments: enrichmentsCount.count || 0,
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Database statistics retrieved successfully',
    });

  } catch (error) {
    console.error('❌ Failed to get statistics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve statistics',
      },
      { status: 500 }
    );
  }
}
