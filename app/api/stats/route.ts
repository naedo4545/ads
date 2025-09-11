import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 광고 수 통계
    const { data: adsData, error: adsError } = await supabase
      .from('ads')
      .select('id, platform, country, created_at');

    if (adsError) {
      throw new Error(`Failed to fetch ads: ${adsError.message}`);
    }

    // 광고주 수 통계
    const { data: advertisersData, error: advertisersError } = await supabase
      .from('advertisers')
      .select('id, platform, country');

    if (advertisersError) {
      throw new Error(`Failed to fetch advertisers: ${advertisersError.message}`);
    }

    // AI 분석 완료된 광고 수
    const { data: enrichmentsData, error: enrichmentsError } = await supabase
      .from('ad_enrichments')
      .select('id, created_at');

    if (enrichmentsError) {
      throw new Error(`Failed to fetch enrichments: ${enrichmentsError.message}`);
    }

    // 통계 계산
    const stats = {
      total_ads: adsData.length,
      total_advertisers: advertisersData.length,
      analyzed_ads: enrichmentsData.length,
      analysis_rate: adsData.length > 0 ? (enrichmentsData.length / adsData.length * 100).toFixed(2) : 0,
      platform_distribution: calculateDistribution(adsData, 'platform'),
      country_distribution: calculateDistribution(adsData, 'country'),
      recent_activity: {
        last_24h: adsData.filter(ad => 
          new Date(ad.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        last_7d: adsData.filter(ad => 
          new Date(ad.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        last_30d: adsData.filter(ad => 
          new Date(ad.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
      },
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully',
    });

  } catch (error) {
    console.error('❌ Stats API failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve statistics',
      },
      { status: 500 }
    );
  }
}

function calculateDistribution(data: any[], field: string): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  data.forEach(item => {
    const value = item[field] || 'Unknown';
    distribution[value] = (distribution[value] || 0) + 1;
  });

  return distribution;
}
